import { ObservableInput, Source, FOType, Sink } from "../types";
import { Observable, sourceAsObservable } from "../Observable";
import { Subscription } from "../Subscription";
import { ofSource } from "./of";

export function from<T>(input: ObservableInput<T>): Observable<T> {
  return sourceAsObservable(fromSource(input));
}

export function fromSource<T>(input: any): Source<T> {
  if (input instanceof Observable) {
    return input;
  } else if (typeof input.then === 'function') {
    return promiseSource(input);
  } else if (isArrayLike(input)) {
    return ofSource(input);
  } else if (typeof input[Symbol.iterator] === 'function') {
    return iterableSource(input);
  }
  throw new Error('Unable to convert from input to Observable source');
}

function promiseSource<T>(promise: PromiseLike<T>): Source<T> {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      let closed = false;
      subs.add(() => closed = true);
      promise.then(value => {
        if (!closed) {
          sink(FOType.NEXT, value, subs);
          sink(FOType.COMPLETE, undefined, subs);
        }
      }, err => {
        sink(FOType.ERROR, err, subs);
      });
    }
  };
}

function iterableSource<T>(iterable: Iterable<T>): Source<T> {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      let closed = false;
      subs.add(() => closed = true);
      const iterator = iterable[Symbol.iterator]();
      while (true) {
        if (closed) return;
        const { done, value } = iterator.next();
        if (done) break;
        sink(FOType.NEXT, value, subs);
      }
      sink(FOType.COMPLETE, undefined, subs);
    }
  };
}


function isArrayLike(obj: any) {
  return obj && typeof obj.length === 'number';
}
