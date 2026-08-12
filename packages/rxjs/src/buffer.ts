import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const buffer: unique symbol = Symbol('buffer');

declare global {
  interface Observable<T> {
    [buffer]: (config: {
      delay?: number | (() => ObservableValue<any>);
      maxSize?: number;
      startEvery?: number;
      emitEmpty?: boolean;
      emitRemainingOnComplete?: boolean;
      emitRemainingOnError?: boolean;
      restartDelay?: boolean;
    }) => Observable<T[]>;
  }
}

Observable.prototype[buffer] = function <T>(
  this: Observable<T>,
  config: {
    delay?: number | (() => ObservableValue<any>);
    maxSize?: number;
    startEvery?: number;
    emitEmpty?: boolean;
    emitRemainingOnComplete?: boolean;
    emitRemainingOnError?: boolean;
    restartDelay?: boolean;
  }
): Observable<T[]> {
  return this[create]((subscriber) => {
    const {
      delay = Infinity,
      maxSize = Infinity,
      startEvery,
      emitEmpty = false,
      emitRemainingOnComplete = true,
      emitRemainingOnError = true,
      restartDelay = true,
    } = config;
    let buffer: T[] | null = null;
    let countBuffers: T[][] | null = startEvery === undefined ? null : [[]];
    const countWindowInterval = startEvery ?? Infinity;
    let valuesSeen = 0;
    let done = false;

    let notifierController: AbortController | null = null;

    const takeBuffer = () => {
      const currentBuffer = buffer;
      buffer = null;
      return currentBuffer;
    };

    const closeDelay = () => {
      notifierController?.abort();
      notifierController = null;
    };

    const maybeStartDelay = () => {
      if (delay === Infinity || countBuffers) return;

      notifierController = new AbortController();

      const signal = AbortSignal.any([notifierController.signal, subscriber.signal]);

      if (typeof delay === 'number') {
        const id = globalThis.setTimeout(emitBuffer, delay);
        signal.addEventListener('abort', () => globalThis.clearTimeout(id), {
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
        subscribeToSource(result, subscriber, { next: emitBuffer, complete: () => void 0 }, notifierController.signal);
      }
    };

    const emitBuffer = () => {
      const currentBuffer = takeBuffer();
      if (restartDelay) {
        closeDelay();
      }
      if (currentBuffer?.length) {
        subscriber.next(currentBuffer);
      } else if (emitEmpty) {
        subscriber.next([]);
      }
      if (!done && restartDelay) {
        maybeStartDelay();
      }
    };

    const emitFinalBuffer = () => {
      closeDelay();
      const currentBuffer = takeBuffer();
      if (currentBuffer?.length) {
        subscriber.next(currentBuffer);
      } else if (emitEmpty) {
        subscriber.next([]);
      }
    };

    const emitCountBuffers = (buffers: T[][]) => {
      for (const currentBuffer of buffers) {
        if (currentBuffer.length) {
          subscriber.next(currentBuffer);
        } else if (emitEmpty) {
          subscriber.next([]);
        }
      }
    };

    const emitRemainingCountBuffers = () => {
      const remainingBuffers = countBuffers;
      countBuffers = [];
      if (remainingBuffers) {
        emitCountBuffers(remainingBuffers);
      }
    };

    maybeStartDelay();
    if (!subscriber.active) {
      return;
    }

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (countBuffers) {
          const completedBuffers: T[][] = [];
          for (const currentBuffer of countBuffers) {
            currentBuffer.push(value);
            if (currentBuffer.length >= maxSize) {
              completedBuffers.push(currentBuffer);
            }
          }
          if (completedBuffers.length) {
            const completed = new Set(completedBuffers);
            countBuffers = countBuffers.filter((currentBuffer) => !completed.has(currentBuffer));
            emitCountBuffers(completedBuffers);
          }
          valuesSeen++;
          if (valuesSeen % countWindowInterval === 0) {
            countBuffers.push([]);
          }
          return;
        }
        buffer ??= [];
        buffer.push(value);
        if (buffer.length >= maxSize) {
          emitBuffer();
        }
      },
      error: (error) => {
        done = true;
        if (emitRemainingOnError) {
          if (countBuffers) {
            emitRemainingCountBuffers();
          } else {
            emitFinalBuffer();
          }
        }
        subscriber.error(error);
      },
      complete: () => {
        done = true;
        if (emitRemainingOnComplete) {
          if (countBuffers) {
            emitRemainingCountBuffers();
          } else {
            emitFinalBuffer();
          }
        }
        subscriber.complete();
      },
    });
  });
};
