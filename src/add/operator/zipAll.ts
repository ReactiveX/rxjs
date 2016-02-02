
import {Observable} from '../../Observable';
import {zipAll} from '../../operator/zipAll';

Observable.prototype.zipAll = zipAll;

declare module '../../Observable' {
  interface Observable<T> {
    zipAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;
  }
}

export var _void: void;