
import {Observable} from '../../Observable';
import {concatMapTo} from '../../operator/concatMapTo';

Observable.prototype.concatMapTo = concatMapTo;

declare module '../../Observable' {
  interface Observable<T> {
    concatMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  }
}

export var _void: void;