
import {Observable} from '../../Observable';
import {map} from '../../operator/map';

Observable.prototype.map = map;

declare module '../../Observable' {
  interface Observable<T> {
    map: <R>(project: (x: T, ix?: number) => R, thisArg?: any) => Observable<R>;
  }
}