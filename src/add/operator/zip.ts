
import {Observable} from '../../Observable';
import {zipProto} from '../../operator/zip';

Observable.prototype.zip = zipProto;

declare module '../../Observable' {
  interface Observable<T> {
    zip: <R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>) => Observable<R>;
  }
}