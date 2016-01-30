
import {Observable} from '../../Observable';
import {combineLatest} from '../../operator/combineLatest';

Observable.prototype.combineLatest = combineLatest;

declare module '../../Observable' {
  interface Observable<T> {
    combineLatest: <R>(...observables: Array<Observable<any> |
                                      Array<Observable<any>> |
                                      ((...values: Array<any>) => R)>) => Observable<R>;
  }
}

export var _void: void;