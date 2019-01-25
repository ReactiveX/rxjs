import { ObservableInput, InteropObservable } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { isPromiseLike } from 'rxjs/internal/util/isPromiseLike';
import { isObservable } from 'rxjs/internal/util/isObservable';
import { isArrayLike } from 'rxjs/internal/util/isArrayLike';
import { isIterable } from 'rxjs/internal/util/isIterable';
import { isInteropObservable } from 'rxjs/internal/util/isInteropObservable';
import { isAsyncIterable } from 'rxjs/internal/util/isAsyncIterable';
import { symbolIterator } from 'rxjs/internal/util/symbolIterator';
import { symbolObservable } from 'rxjs/internal/util/symbolObservable';
import { symbolAsyncIterator } from 'rxjs/internal/util/symbolAsyncIterator';

export function from<T>(input: ObservableInput<T>): Observable<T> {
  if (isObservable<T>(input)) {
    return input;
  } else if (isPromiseLike(input)) {
    return fromPromise(input);
  } else if (isArrayLike(input)) {
    return fromArrayLike(input);
  } else if (isIterable(input)) {
    return fromIterable(input);
  } else if (isInteropObservable(input)) {
    return fromInteropObservable(input);
  } else if (isAsyncIterable(input)) {
    return fromAsyncIterable(input);
  }
  throw new Error('Unable to convert from input to Observable source');
}

function fromArrayLike<T>(arr: ArrayLike<T>): Observable<T> {
  return new Observable<T>(subscriber => {
    for (let i = 0; i < arr.length && !subscriber.closed; i++) {
      subscriber.next(arr[i]);
    }
    subscriber.complete();
  });
}

function fromPromise<T>(promise: PromiseLike<T>): Observable<T> {
  return new Observable<T>(subscriber => {
    promise.then(value => {
      if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
      }
    }, err => {
      !subscriber.closed && subscriber.error(err);
    });
  });
}

function fromIterable<T>(iterable: Iterable<T>): Observable<T> {
  return new Observable<T>(subscriber => {
    const iterator = iterable[symbolIterator]();

    while (!subscriber.closed) {
      const { done, value } = iterator.next();
      if (done) {
        subscriber.complete();
        return;
      } else {
        subscriber.next(value);
      }
    }
  });
}

function fromInteropObservable<T>(interopObservable: InteropObservable<T>): Observable<T> {
  return new Observable<T>(subscriber => {
    return interopObservable[symbolObservable]().subscribe(subscriber);
  });
}

function fromAsyncIterable<T>(asyncIterable: AsyncIterable<T>): Observable<T> {
  return new Observable<T>(subscriber => {
    const asyncIterator: AsyncIterableIterator<T> = asyncIterable[symbolAsyncIterator]();

    const iterate = () => {
      if (!subscriber.closed) {
        asyncIterator.next().then(({ done, value }) => {
          if (!subscriber.closed) {
            if (done) {
              subscriber.complete();
            } else {
              subscriber.next(value);
              iterate();
            }
          }
        });
      }
    };

    iterate();
  });
}
