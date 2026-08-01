import { create } from './create.js';
import { TimeoutError, type TimeoutInfo } from './timeout-error.js';
import { convertObservableValue, subscribeToSource } from './util/observable-helpers.js';

export { TimeoutError, type TimeoutInfo } from './timeout-error.js';

export const timeout: unique symbol = Symbol('timeout');

declare global {
  interface Observable<T> {
    [timeout]: <M, W>(config: {
      each?: number;
      first?: number | Date;
      with?: (info: TimeoutInfo<T, M>) => ObservableValue<W>;
      meta?: M;
    }) => Observable<T | W>;
  }
}

function timeoutOperator<T, W, M>(
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
          let nextSource: Observable<W>;
          try {
            nextSource = convertObservableValue({
              value: _with({
                meta,
                lastValue,
                seen,
              }),
            });
          } catch (error) {
            subscriber.error(error);
            return;
          }

          subscribeToSource(nextSource, subscriber, { next: (value) => subscriber.next(value) });
        }, Math.max(0, delay));
      } catch (error) {
        subscriber.error(error);
        return;
      }

      signal.addEventListener('abort', () => globalThis.clearTimeout(id), { once: true });
    };

    subscribeToSource(
      this,
      subscriber,
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
      sourceController.signal
    );

    if (subscriber.active && seen === 0) {
      const initialDelay = first != null ? (typeof first === 'number' ? first : +first - globalThis.Date.now()) : each ?? 0;

      startTimer(initialDelay);
    }
  });
}

Observable.prototype[timeout] = timeoutOperator;

function timeoutErrorFactory(info: TimeoutInfo<any, any>): never {
  throw new TimeoutError(info);
}
