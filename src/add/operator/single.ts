
import {Observable} from '../../Observable';
import {single} from '../../operator/single';

Observable.prototype.single = single;

declare module '../../Observable' {
  interface Observable<T> {
    single: (predicate?: (value: T, index: number) => boolean) => Observable<T>;
  }
}

export var _void: void;