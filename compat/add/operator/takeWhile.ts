
import { Observable } from '../../internal/Observable';
import { takeWhile } from '../../internal/patching/operator/takeWhile';

Observable.prototype.takeWhile = takeWhile;

declare module '../../internal/Observable' {
  interface Observable<T> {
    takeWhile: typeof takeWhile;
  }
}
