
import {Observable} from '../../Observable';
import {switchMapTo} from '../../operator/switchMapTo';

Observable.prototype.switchMapTo = switchMapTo;

declare module '../../Observable' {
  interface Observable<T> {
    switchMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  }
}

export var _void: void;