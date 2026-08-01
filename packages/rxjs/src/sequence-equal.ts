import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';
import '@rxjs/observable-polyfill';

export const sequenceEqual: unique symbol = Symbol('sequenceEqual');

declare global {
  interface Observable<T> {
    [sequenceEqual](other: Observable<T>, comparator?: (left: T, right: T) => boolean): Observable<boolean>;
  }
}

Observable.prototype[sequenceEqual] = function <T>(
  this: Observable<T>,
  other: Observable<T>,
  comparator?: (left: T, right: T) => boolean
): Observable<boolean> {
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
        const left = bufferA[headA++]!;
        const right = bufferB[headB++]!;
        const equal = comparator ? comparator(left, right) : left === right;
        if (!equal) {
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

    subscribeToSource(this, subscriber, {
      next: (value) => {
        bufferA.push(value);
        checkState();
      },
      complete: () => {
        completeA = true;
        checkState();
      },
    });

    if (!subscriber.active) {
      return;
    }

    subscribeToSource(other, subscriber, {
      next: (value) => {
        bufferB.push(value);
        checkState();
      },
      complete: () => {
        completeB = true;
        checkState();
      },
    });
  });
};
