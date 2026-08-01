import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';

export const expand: unique symbol = Symbol('expand');

export interface ExpandOptions {
  concurrent?: number;
}

declare global {
  interface Observable<T> {
    [expand]<R>(project: (value: T, index: number) => ObservableValue<R>, options?: ExpandOptions): Observable<T | R>;
  }
}

installObservableExtension({
  instance: function <T, R>(
    this: Observable<T>,
    project: (value: T, index: number) => ObservableValue<R>,
    options?: ExpandOptions
  ): Observable<T | R> {
    if (arguments.length > 2) {
      throw new TypeError('RxJS Next expand does not support a scheduler argument.');
    }
    if (options !== undefined && (typeof options !== 'object' || options === null)) {
      throw new TypeError('RxJS Next expand options must be an object.');
    }

    const configuredConcurrency = options?.concurrent ?? Infinity;
    const concurrency = configuredConcurrency >= 1 ? configuredConcurrency : Infinity;

    return this[create]((subscriber) => {
      const queue: Array<T | R> = [];
      let active = 0;
      let index = 0;
      let sourceComplete = false;
      let draining = false;

      const checkComplete = (): void => {
        if (sourceComplete && active === 0 && queue.length === 0 && subscriber.active) {
          subscriber.complete();
        }
      };

      const drain = (): void => {
        if (draining || !subscriber.active) {
          return;
        }

        draining = true;
        try {
          while (subscriber.active && active < concurrency && queue.length > 0) {
            const value = queue.shift()!;
            subscriber.next(value);
            if (!subscriber.active) {
              break;
            }

            let inner: Observable<R>;
            try {
              inner = Observable.from(project(value as T, index++));
            } catch (error) {
              subscriber.error(error);
              break;
            }

            active++;
            let innerActive = true;
            try {
              inner.subscribe(
                {
                  next: (innerValue) => {
                    if (subscriber.active) {
                      queue.push(innerValue);
                      drain();
                    }
                  },
                  error: (error) => {
                    if (innerActive) {
                      innerActive = false;
                      active--;
                    }
                    subscriber.error(error);
                  },
                  complete: () => {
                    if (!innerActive) {
                      return;
                    }
                    innerActive = false;
                    active--;
                    drain();
                    checkComplete();
                  },
                },
                { signal: subscriber.signal }
              );
            } catch (error) {
              if (innerActive) {
                innerActive = false;
                active--;
              }
              subscriber.error(error);
            }
          }
        } finally {
          draining = false;
        }

        checkComplete();
      };

      subscriber.addTeardown(() => {
        queue.length = 0;
      });

      this.subscribe(
        {
          next: (value) => {
            queue.push(value);
            drain();
          },
          error: (error) => subscriber.error(error),
          complete: () => {
            sourceComplete = true;
            drain();
            checkComplete();
          },
        },
        { signal: subscriber.signal }
      );
    });
  },
  name: 'expand',
  symbol: expand,
});
