
import {Observable} from '../../Observable';
import {last} from '../../operator/last';

Observable.prototype.last = last;

declare module '../../Observable' {
  interface Observable<T> {
    last: <R>(predicate?: (value: T, index: number) => boolean,
      resultSelector?: (value: T, index: number) => R,
      defaultValue?: any) => Observable<T> | Observable<R>;
  }
}

export var _void: void;