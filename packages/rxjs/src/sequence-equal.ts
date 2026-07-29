import { create } from './create.js';
import '@rxjs/observable-polyfill';

export const sequenceEqual: unique symbol = Symbol('sequenceEqual');

declare global {
  interface Observable<T> {
    [sequenceEqual](other: Observable<T>): Observable<boolean>;
  }
}

Observable.prototype[sequenceEqual] = function <T>(this: Observable<T>, other: Observable<T>): Observable<boolean> {
  return this[create]((subscriber) => {
    let bufferA: T[] = [];
    let bufferB: T[] = [];
    let headA = 0;
    let headB = 0;
    let completeA = false;
    let completeB = false;

    const conclude = (equal: boolean): void => {
      subscriber.next(equal);
      subscriber.complete();
    };

    const checkState = (): void => {
      while (headA < bufferA.length && headB < bufferB.length) {
        if (bufferA[headA++] !== bufferB[headB++]) {
          conclude(false);
          return;
        }
      }

      if (headA === bufferA.length) {
        bufferA = [];
        headA = 0;
      }
      if (headB === bufferB.length) {
        bufferB = [];
        headB = 0;
      }

      const hasA = headA < bufferA.length;
      const hasB = headB < bufferB.length;
      if ((completeA && !hasA && hasB) || (completeB && !hasB && hasA)) {
        conclude(false);
      } else if (completeA && completeB) {
        conclude(!hasA && !hasB);
      }
    };

    this.subscribe(
      {
        next: (value) => {
          bufferA.push(value);
          checkState();
        },
        error: (error) => {
          subscriber.error(error);
        },
        complete: () => {
          completeA = true;
          checkState();
        },
      },
      { signal: subscriber.signal }
    );

    if (!subscriber.active) {
      return;
    }

    other.subscribe(
      {
        next: (value) => {
          bufferB.push(value);
          checkState();
        },
        error: (error) => {
          subscriber.error(error);
        },
        complete: () => {
          completeB = true;
          checkState();
        },
      },
      { signal: subscriber.signal }
    );
  });
};
