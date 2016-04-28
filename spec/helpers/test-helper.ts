///<reference path='../../typings/main.d.ts'/>
declare const global: any;
declare const Symbol: any;

import * as Rx from '../../dist/cjs/Rx';
import {root} from '../../dist/cjs/util/root';

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

global.__root__ = root;
