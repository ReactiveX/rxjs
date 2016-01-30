
import {Observable} from '../../Observable';
import {reduce} from '../../operator/reduce';

Observable.prototype.reduce = reduce;

declare module '../../Observable' {
  interface Observable<T> {
    reduce: <R>(project: (acc: R, x: T) => R, seed?: R) => Observable<R>;
  }
}

export var _void: void;