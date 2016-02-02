
import {Observable} from '../../Observable';
import {scan} from '../../operator/scan';

Observable.prototype.scan = scan;

declare module '../../Observable' {
  interface Observable<T> {
    scan: <R>(accumulator: (acc: R, x: T) => R, seed?: T | R) => Observable<R>;
  }
}