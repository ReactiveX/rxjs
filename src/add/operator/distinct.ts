import { Observable } from '../../Observable';
import { distinct, DistinctSignature } from '../../operator/distinct';

Observable.prototype.distinct = distinct;

declare module '../../Observable' {
  interface Observable<T> {
    distinct: DistinctSignature<T>;
  }
}