
import {Observable} from '../../Observable';
import {mapTo} from '../../operator/mapTo';

Observable.prototype.mapTo = mapTo;

declare module '../../Observable' {
  interface Observable<T> {
    mapTo: <R>(value: R) => Observable<R>;
  }
}

export var _void: void;