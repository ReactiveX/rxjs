
import {Observable} from '../../Observable';
import {count} from '../../operator/count';

Observable.prototype.count = count;

declare module '../../Observable' {
  interface Observable<T> {
    count: (predicate?: (value: T, index: number, source: Observable<T>) => boolean) => Observable<number>;
  }
}

export var _void: void;