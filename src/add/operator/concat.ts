
import {Observable} from '../../Observable';
import {concat} from '../../operator/concat';
import {Scheduler} from '../../Scheduler';

Observable.prototype.concat = concat;

declare module '../../Observable' {
  interface Observable<T> {
    concat: <R>(...observables: (Observable<any> | Scheduler)[]) => Observable<R>;
  }
}