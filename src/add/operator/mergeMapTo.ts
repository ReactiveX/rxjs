
import {Observable} from '../../Observable';
import {mergeMapTo} from '../../operator/mergeMapTo';

Observable.prototype.flatMapTo = mergeMapTo;
Observable.prototype.mergeMapTo = mergeMapTo;

declare module '../../Observable' {
  interface Observable<T> {
    flatMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
    mergeMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
  }
}