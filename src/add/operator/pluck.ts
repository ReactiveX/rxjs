
import { Observable } from '../../Observable';
import { pluck, PluckSignature } from '../../operator/pluck';

Observable.prototype.pluck = pluck;

declare module '../../Observable' {
  interface Observable<T> {
    pluck: PluckSignature<T>;
  }
}