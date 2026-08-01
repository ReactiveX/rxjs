import { create } from './create.js';

export const mergeScan: unique symbol = Symbol('mergeScan');

declare global {
  interface Observable<T> {
    [mergeScan]<R>(
      accumulator: (accumulator: R, value: T, index: number) => ObservableValue<R>,
      seed: R,
      concurrent?: number
    ): Observable<R>;
  }
}

Observable.prototype[mergeScan] = function <T, R>(
  this: Observable<T>,
  accumulator: (accumulator: R, value: T, index: number) => ObservableValue<R>,
  seed: R,
  concurrent = Infinity
): Observable<R> {
  const source = this;

  return source[create]((subscriber) => {
    const buffer: T[] = [];
    let state = seed;
    let index = 0;
    let active = 0;
    let sourceComplete = false;
    let draining = false;

    const completeIfDone = (): void => {
      if (sourceComplete && active === 0 && buffer.length === 0) {
        subscriber.complete();
      }
    };

    const drainBuffer = (): void => {
      if (draining || !subscriber.active) {
        return;
      }

      draining = true;
      try {
        while (subscriber.active && active < concurrent && buffer.length > 0) {
          startInner(buffer.shift()!);
        }
        completeIfDone();
      } finally {
        draining = false;
      }
    };

    const startInner = (value: T): void => {
      const currentIndex = index++;
      let input: ObservableValue<R>;

      try {
        input = accumulator(state, value, currentIndex);
      } catch (error) {
        subscriber.error(error);
        return;
      }

      let inner: Observable<R>;
      try {
        inner = Observable.from(input);
      } catch (error) {
        subscriber.error(error);
        return;
      }

      if (!subscriber.active) {
        return;
      }

      active++;
      let terminated = false;

      try {
        inner.subscribe(
          {
            next: (innerValue) => {
              state = innerValue;
              subscriber.next(innerValue);
            },
            error: (error) => {
              if (!terminated) {
                terminated = true;
                active--;
                subscriber.error(error);
              }
            },
            complete: () => {
              if (terminated) {
                return;
              }
              terminated = true;
              active--;
              drainBuffer();
            },
          },
          { signal: subscriber.signal }
        );
      } catch (error) {
        if (!terminated) {
          terminated = true;
          active--;
          subscriber.error(error);
        }
      }
    };

    try {
      source.subscribe(
        {
          next: (value) => {
            if (active < concurrent) {
              startInner(value);
            } else {
              buffer.push(value);
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => {
            sourceComplete = true;
            completeIfDone();
          },
        },
        { signal: subscriber.signal }
      );
    } catch (error) {
      subscriber.error(error);
    }
  });
};
