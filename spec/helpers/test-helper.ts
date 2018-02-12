declare const global: any;

import * as Rx from '../../src/Rx';
import { ObservableInput } from '../../src/internal/Observable';
import { root } from '../../src/internal/util/root';
import { $$iterator } from '../../src/internal/symbol/iterator';
import $$symbolObservable from 'symbol-observable';

export function lowerCaseO<T>(...args: Array<any>): Rx.Observable<T> {
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

export const createObservableInputs = <T>(value: T) => Rx.Observable.of<ObservableInput<T>>(
  Rx.Observable.of<T>(value),
  Rx.Observable.of<T>(value, Rx.Scheduler.async),
  [value],
  Promise.resolve(value),
  <any>({
  [$$iterator]: () => {
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
  <any>({ [$$symbolObservable]: () => Rx.Observable.of(value) })
);

global.__root__ = root;
