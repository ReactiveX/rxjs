
import {Observable} from '../../Observable';
import {filter} from '../../operator/filter';

Observable.prototype.filter = filter;

declare module '../../Observable' {
  interface Observable<T> {
    filter: (predicate: (x: T) => boolean, ix?: number, thisArg?: any) => Observable<T>;
  }
}