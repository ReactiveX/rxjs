
import {Observable} from '../../Observable';
import {first} from '../../operator/first';

Observable.prototype.first = first;

declare module '../../Observable' {
  interface Observable<T> {
    first: <R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean,
      resultSelector?: (value: T, index: number) => R, defaultValue?: any) => Observable<T> | Observable<R>;
  }
}

export var _void: void;