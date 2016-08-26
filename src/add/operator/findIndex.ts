
import { Observable } from '../../Observable';
import { findIndex, FindIndexSignature } from '../../operator/findIndex';

Observable.prototype.findIndex = findIndex;

declare module '../../Observable' {
  interface Observable<T> {
    findIndex: FindIndexSignature<T>;
  }
}