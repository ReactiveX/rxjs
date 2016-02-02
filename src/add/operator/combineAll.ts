
import {Observable} from '../../Observable';
import {combineAll} from '../../operator/combineAll';

Observable.prototype.combineAll = combineAll;

declare module '../../Observable' {
  interface Observable<T> {
    combineAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;
  }
}