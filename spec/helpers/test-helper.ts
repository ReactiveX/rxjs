declare const global: any;

import { ObservableInput, of, asyncScheduler, Observable } from 'rxjs';
import { iterator } from 'rxjs/internal/symbol/iterator';
import { root } from 'rxjs/internal/util/root';
import $$symbolObservable from 'symbol-observable';

export function lowerCaseO<T>(...args: Array<any>): Observable<T> {
  const o = {
    subscribe(observer: any) {
      args.forEach(v => observer.next(v));
      observer.complete();
      return {
        unsubscribe() { /* do nothing */ }
      };
    }
  };

  o[$$symbolObservable] = function (this: any) {
    return this;
  };

  return <any>o;
}

export const createObservableInputs = <T>(value: T) => of<ObservableInput<T>>(
  of(value),
  of(value, asyncScheduler),
  [value],
  Promise.resolve(value),
  <any>({
  [iterator]: () => {
    const iteratorResults = [
      { value, done: false },
      { done: true }
    ];
    return {
      next: () => {
        return iteratorResults.shift();
      }
    };
  }
  }),
  <any>({ [$$symbolObservable]: () => of(value) })
);

global.__root__ = root;
