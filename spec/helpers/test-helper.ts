declare const global: any;
declare const Symbol: any;

import * as Rx from '../../dist/cjs/Rx';
import {ObservableInput} from '../../dist/cjs/Observable';
import {root} from '../../dist/cjs/util/root';
import {$$iterator} from '../../dist/cjs/symbol/iterator';
import $$symbolObservable from 'symbol-observable';

export function lowerCaseO<T>(...args): Rx.Observable<T> {
  const values = [].slice.apply(arguments);

  const o = {
    subscribe: function (observer) {
      values.forEach(function (v) {
        observer.next(v);
      });
      observer.complete();
    }
  };

  o[Symbol.observable] = function () {
    return this;
  };

  return <any>o;
};

export const createObservableInputs = <T>(value: T) => Rx.Observable.of<ObservableInput<T>>(
  Rx.Observable.of<T>(value),
  Rx.Observable.of<T>(value, Rx.Scheduler.async),
  [value],
  Promise.resolve(value),
  <any>({ [$$iterator]: () => {
      const iteratorResults = [
        {value, done: false},
        {done: true}
      ];
      return {
        next: () => {
          return iteratorResults.shift();
        }
      };
    }}),
  <any>({ [$$symbolObservable]: () => Rx.Observable.of(value) })
);

global.__root__ = root;
