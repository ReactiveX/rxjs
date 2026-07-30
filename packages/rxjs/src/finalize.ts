import { create } from './create.js';

export const finalize: unique symbol = Symbol('finalize');

declare global {
  interface Observable<T> {
    [finalize]: (callback: () => void) => Observable<T>;
  }
}

Observable.prototype[finalize] = function <T>(this: Observable<T>, callback: () => void): Observable<T> {
  return this[create]((subscriber) => {
    let finalized = false;
    let sourceTerminated = false;

    const finalizeOnce = () => {
      if (!finalized) {
        finalized = true;
        callback();
      }
    };

    subscriber.addTeardown(() => {
      if (!sourceTerminated) {
        finalizeOnce();
      }
    });

    this.subscribe(
      {
        next: (value) => subscriber.next(value),
        error: (error) => {
          sourceTerminated = true;
          try {
            subscriber.error(error);
          } finally {
            finalizeOnce();
          }
        },
        complete: () => {
          sourceTerminated = true;
          try {
            subscriber.complete();
          } finally {
            finalizeOnce();
          }
        },
      },
      { signal: subscriber.signal }
    );
  });
};
