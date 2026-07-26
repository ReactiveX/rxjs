import { create } from './create.js';
import '@rxjs/observable-polyfill';

export const sequenceEqual: unique symbol = Symbol('sequenceEqual');

declare global {
  interface Observable<T> {
    [sequenceEqual](other: Observable<T>): Observable<boolean>;
  }
}

Observable.prototype[sequenceEqual] = function <A, B>(this: Observable<A>, other: Observable<B>): Observable<boolean> {
  return this[create]((subscriber) => {
    const bufferA: A[] = [];
    const bufferB: B[] = [];
    let completeA = false;
    let completeB = false;

    const checkBuffers = () => {
        if (bufferA.length === bufferB.length) {
            for (let i = 0; i < bufferA.length; i++) {
                if (bufferA[i] !== bufferB[i]) {
                    subscriber.next(false);
                    subscriber.complete();
                    return;
                }
            }
            bufferA.length = 0;
            bufferB.length = 0;
        }
    }

    const checkComplete = () => {
        if (completeA && completeB) {
            subscriber.next(bufferA.length === bufferB.length && bufferA.every((value, index) => value === bufferB[index]));
            subscriber.complete();
        }
    }

    this.subscribe({
      next: (value) => {
        bufferA.push(value);
        checkBuffers();
      },
      error: (error) => {
        subscriber.error(error);
      },
      complete: () => {
        completeA = true;
        checkComplete();
      },
    }, { signal: subscriber.signal });
    other.subscribe({
      next: (value) => {
        bufferB.push(value);
        checkBuffers();
      },
      error: (error) => {
        subscriber.error(error);
      },
      complete: () => {
        completeB = true;
        checkComplete();
      },
    }, { signal: subscriber.signal });
  });
}