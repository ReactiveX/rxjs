
import { Observable } from '../../Observable';
import { takeWhile, TakeWhileSignature } from '../../operator/takeWhile';

Observable.prototype.takeWhile = takeWhile;

declare module '../../Observable' {
  interface Observable<T> {
    takeWhile: TakeWhileSignature<T>;
  }
}