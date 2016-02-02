
import {Observable} from '../../Observable';
import {concatMap} from '../../operator/concatMap';

Observable.prototype.concatMap = concatMap;

declare module '../../Observable' {
  interface Observable<T> {
    concatMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  }
}