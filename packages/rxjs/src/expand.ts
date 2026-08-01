import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const expand: unique symbol = Symbol('expand');

export interface ExpandOptions {
  concurrent?: number;
}

declare global {
  interface Observable<T> {
    [expand]<R>(project: (value: T, index: number) => ObservableValue<R>, options?: ExpandOptions): Observable<T | R>;
  }
}

Observable.prototype[expand] = function <T, R>(
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

          const inner = Observable.from(project(value as T, index++));

          active++;
          let innerActive = true;
          subscribeToSource(inner, subscriber, {
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
          });
        }
      } finally {
        draining = false;
      }

      checkComplete();
    };

    subscriber.addTeardown(() => {
      queue.length = 0;
    });

    subscribeToSource(this, subscriber, {
      next: (value) => {
        queue.push(value);
        drain();
      },
      complete: () => {
        sourceComplete = true;
        drain();
        checkComplete();
      },
    });
  });
};
