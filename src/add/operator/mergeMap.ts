
import {Observable} from '../../Observable';
import {mergeMap} from '../../operator/mergeMap';

Observable.prototype.mergeMap = mergeMap;
Observable.prototype.flatMap = mergeMap;

declare module '../../Observable' {
  interface Observable<T> {
    flatMap: <R>(project: ((x: T, ix: number) => Observable<any>),
      projectResult?: (x: T, y: any, ix: number, iy: number) => R,
      concurrent?: number) => Observable<R>;
    mergeMap: <R>(project: ((x: T, ix: number) => Observable<any>),
      projectResult?: (x: T, y: any, ix: number, iy: number) => R,
      concurrent?: number) => Observable<R>;
  }
}

export var _void: void;