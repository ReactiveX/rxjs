
import { Observable } from '../../Observable';
import { takeUntil } from '../../internal/patching/operator/takeUntil';

Observable.prototype.takeUntil = takeUntil;

declare module '../../Observable' {
  interface Observable<T> {
    takeUntil: typeof takeUntil;
  }
}
