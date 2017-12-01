
import { Observable } from '../../internal/Observable';
import { takeUntil } from '../../internal/patching/operator/takeUntil';

Observable.prototype.takeUntil = takeUntil;

declare module '../../internal/Observable' {
  interface Observable<T> {
    takeUntil: typeof takeUntil;
  }
}
