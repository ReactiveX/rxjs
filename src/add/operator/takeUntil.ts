
import { Observable } from '../../Observable';
import { takeUntil, TakeUntilSignature } from '../../operator/takeUntil';

Observable.prototype.takeUntil = takeUntil;

declare module '../../Observable' {
  interface Observable<T> {
    takeUntil: TakeUntilSignature<T>;
  }
}