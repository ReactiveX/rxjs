import { create } from './create.js';

export const buffer: unique symbol = Symbol.for('buffer');

declare global {
  interface Observable<T> {
    [buffer]: (config: {
      delay?: number | (() => ObservableValue<any>);
      maxSize?: number;
      emitEmpty?: boolean;
      emitRemainingOnComplete?: boolean;
      emitRemainingOnError?: boolean;
    }) => Observable<T[]>;
  }
}

Observable.prototype[buffer] = function <T>(
  this: Observable<T>,
  config: {
    delay?: number | (() => ObservableValue<any>);
    maxSize?: number;
    emitEmpty?: boolean;
    emitRemainingOnComplete?: boolean;
    emitRemainingOnError?: boolean;
  }
): Observable<T[]> {
  return this[create]((subscriber) => {
    const { delay = Infinity, maxSize = Infinity, emitEmpty = false, emitRemainingOnComplete = true, emitRemainingOnError = true } = config;
    let buffer: T[] | null = null;
    let done = false;

    let notifierController: AbortController | null = null;

    const closeBuffer = () => {
      const currentBuffer = buffer;
      buffer = null;
      notifierController?.abort();
      notifierController = null;
      return currentBuffer;
    };

    const maybeStartDelay = () => {
      if (delay === Infinity) return;

      notifierController = new AbortController();

      const signal = AbortSignal.any([notifierController.signal, subscriber.signal]);

      if (typeof delay === 'number') {
        const id = setTimeout(emitBuffer, delay);
        signal.addEventListener('abort', () => clearTimeout(id), {
          once: true,
        });
      } else {
        let result: Observable<any>;
        try {
          result = Observable.from(delay());
        } catch (error) {
          subscriber.error(error);
          return;
        }
        result.subscribe(
          {
            next: emitBuffer,
            error: (error) => subscriber.error(error),
          },
          { signal }
        );
      }
    };

    const emitBuffer = () => {
      const currentBuffer = closeBuffer();
      if (currentBuffer?.length) {
        subscriber.next(currentBuffer);
      } else if (emitEmpty) {
        subscriber.next([]);
      }
      if (!done) {
        maybeStartDelay();
      }
    };

    maybeStartDelay();

    this.subscribe(
      {
        next: (value) => {
          buffer ??= [];
          buffer.push(value);
          if (buffer.length >= maxSize) {
            emitBuffer();
          }
        },
        error: (error) => {
          done = true;
          if (emitRemainingOnError) {
            emitBuffer();
          }
          subscriber.error(error);
        },
        complete: () => {
          done = true;
          if (emitRemainingOnComplete) {
            emitBuffer();
          }
          subscriber.complete();
        },
      },
      { signal: subscriber.signal }
    );
  });
};
