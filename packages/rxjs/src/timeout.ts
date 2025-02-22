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
      meta: M;
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

    const startTimer = (delay: number) => {
      timerController = new AbortController();

      const signal = AbortSignal.any([subscriber.signal, timerController.signal]);

      const id = setTimeout(() => {
        timerController = null;
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
      }, delay);

      signal.addEventListener('abort', () => clearTimeout(id), { once: true });
    };

    this.subscribe({
      next: (value) => {
        timerController?.abort();
        timerController = null;
        seen++;
        lastValue = value;
        subscriber.next(value);
        if (each !== null) {
          startTimer(each);
        }
      },
    });

    if (seen === 0) {
      const initialDelay = first != null ? (typeof first === 'number' ? first : +first - Date.now()) : (each ?? 0);

      startTimer(initialDelay);
    }
  });
};

class TimeoutError<T, M> extends Error {
  constructor(public info: TimeoutInfo<T, M> | null = null) {
    super('Timeout has occurred');
    this.name = 'TimeoutError';
  }
}

function timeoutErrorFactory(info: TimeoutInfo<any, any>): never {
  throw new TimeoutError(info);
}
