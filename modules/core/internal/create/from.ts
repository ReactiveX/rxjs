import { ObservableInput, FOType, FOArg, FSub, FSubType, ObservableLike, SubscriptionLike } from '../types';
import { of } from './of';
import { Observable, FObservable } from '../observable/Observable';

function fFromPromise<T>(promise: PromiseLike<T>) {
  return (type: FOType, sink: FOArg<T>, subs: FSub) => {
    if (type === FOType.SUBSCRIBE) {
      promise.then(value => {
        if (!subs(FSubType.CHECK)) {
          sink(FOType.NEXT, value, subs);
          sink(FOType.COMPLETE, undefined, subs);
        }
      })
      .then(
        null,
        (err: any) => {
          sink(FOType.ERROR, err, subs);
        }
      );
    }
  };
}

function fFromIterable<T>(iterable: Iterable<T>) {
  return (type: FOType, sink: FOArg<T>, subs: FSub) => {
    if (type === FOType.SUBSCRIBE) {
      const iterator = iterable[Symbol.iterator]();
      while (true) {
        const result = iterator.next();
        if (result.done || subs(FSubType.CHECK)) {
          sink(FOType.COMPLETE, undefined, subs);
        } else {
          sink(FOType.NEXT, result.value, subs);
        }
      }
    }
  };
}

function fFromSymbolObservable(obj: object) {
  const observableLike = obj[Symbol.observable]();
  return fFromObservableLike(observableLike);
}

function fFromObservableLike<T>(observableLike: ObservableLike<T>) {
  return (type: FOType, sink: FOArg<T>, subs: FSub) => {
    if (type === FOType.SUBSCRIBE) {
      let subscription: SubscriptionLike;
      subs(FSubType.ADD, () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });

      subscription = observableLike.subscribe({
        next(value, s) {
          if (!subscription) {
            s = subscription;
          }
          sink(FOType.NEXT, value, subs);
        },
        error(err: any) {
          sink(FOType.ERROR, err, subs);
        },
        complete() {
          sink(FOType.COMPLETE, undefined, subs);
        }
      });
    }
  };
}

export function from<T>(input: ObservableInput<T>): Observable<T> {
  if (input instanceof Observable) {
    return input;
  } else if (typeof (input as PromiseLike<T>).then === 'function') {
    return new FObservable(fFromPromise(input as PromiseLike<T>));
  } else if (Array.isArray(input)) {
    return of(...input);
  } else if (typeof input[Symbol.iterator] === 'function') {
    return new FObservable(fFromIterable(input as Iterable<T>));
  } else if (input[Symbol.observable]) {
    return new FObservable(fFromSymbolObservable(input));
  } else {
    throw new Error('unknown observable type'); // TODO: match old error
  }
}