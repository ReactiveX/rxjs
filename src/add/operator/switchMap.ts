
import {Observable} from '../../Observable';
import {switchMap} from '../../operator/switchMap';

Observable.prototype.switchMap = switchMap;

declare module '../../Observable' {
  interface Observable<T> {
    switchMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  }
}

export var _void: void;