
import {Observable} from '../../Observable';
import {withLatestFrom} from '../../operator/withLatestFrom';

Observable.prototype.withLatestFrom = withLatestFrom;

declare module '../../Observable' {
  interface Observable<T> {
    withLatestFrom: <R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>) => Observable<R>;
  }
}

export var _void: void;