
import {Observable} from '../../Observable';
import {mergeAll} from '../../operator/mergeAll';

Observable.prototype.mergeAll = mergeAll;

declare module '../../Observable' {
  interface Observable<T> {
    mergeAll: (concurrent?: any) => Observable<any>;
  }
}