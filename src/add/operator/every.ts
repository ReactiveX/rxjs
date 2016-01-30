
import {Observable} from '../../Observable';
import {every} from '../../operator/every';

Observable.prototype.every = every;

declare module '../../Observable' {
  interface Observable<T> {
    every: (predicate: (value: T, index: number) => boolean, thisArg?: any) => Observable<T>;
  }
}

export var _void: void;