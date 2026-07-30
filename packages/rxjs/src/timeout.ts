import { create } from './create.js';

export const timeout: unique symbol = Symbol('timeout');

declare global {
  interface TimeoutInfo<T, M> {
    meta: M;
    seen: number;
    lastValue: T | null;
  }

  interface Observable<T> {
    [timeout]: <M, W>(config: {
      each?: number;
      first?: number | Date;
      with?: (info: TimeoutInfo<T, M>) => ObservableValue<W>;
      meta?: M;
    }) => Observable<T | W>;
  }
}

Observable.prototype[timeout] = function <T, W, M>(
  this: Observable<T>,
  config: {
    each?: number;
    first?: number | Date;
    with?: (info: TimeoutInfo<T, M>) => ObservableValue<W>;
    meta?: M;
  }
): Observable<T | W> {
  return this[create]((subscriber) => {
    const { first, each = null, with: _with = timeoutErrorFactory, meta = null! } = config;
    let seen = 0;
    let lastValue: T | null = null;
    let timerController: AbortController | null = null;
    const sourceController = new AbortController();
    const sourceSignal = AbortSignal.any([subscriber.signal, sourceController.signal]);

    const startTimer = (delay: number) => {
      timerController?.abort();
      const controller = new AbortController();
      timerController = controller;

      const signal = AbortSignal.any([subscriber.signal, controller.signal]);

      let id: ReturnType<typeof globalThis.setTimeout>;
      try {
        id = globalThis.setTimeout(() => {
          if (timerController !== controller || !subscriber.active) {
            return;
          }
          timerController = null;
          sourceController.abort();
          let nextSource: Observable<any>;

          try {
            nextSource = Observable.from(
              _with({
                meta,
                lastValue,
                seen,
              })
            );
          } catch (error) {
            subscriber.error(error);
            return;
          }

          nextSource.subscribe(subscriber, { signal: subscriber.signal });
        }, Math.max(0, delay));
      } catch (error) {
        subscriber.error(error);
        return;
      }

      signal.addEventListener('abort', () => globalThis.clearTimeout(id), { once: true });
    };

    this.subscribe(
      {
        next: (value) => {
          timerController?.abort();
          timerController = null;
          seen++;
          lastValue = value;
          subscriber.next(value);
          if (subscriber.active && each !== null) {
            startTimer(each);
          }
        },
        error: (error) => {
          timerController?.abort();
          timerController = null;
          subscriber.error(error);
        },
        complete: () => {
          timerController?.abort();
          timerController = null;
          subscriber.complete();
        },
      },
      { signal: sourceSignal }
    );

    if (subscriber.active && seen === 0) {
      const initialDelay = first != null ? (typeof first === 'number' ? first : +first - globalThis.Date.now()) : each ?? 0;

      startTimer(initialDelay);
    }
  });
};

export class TimeoutError<T = unknown, M = unknown> extends Error {
  constructor(public info: TimeoutInfo<T, M> | null = null) {
    super('Timeout has occurred');
    this.name = 'TimeoutError';
  }
}

function timeoutErrorFactory(info: TimeoutInfo<any, any>): never {
  throw new TimeoutError(info);
}
