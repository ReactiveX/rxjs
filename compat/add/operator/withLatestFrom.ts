
import { Observable } from '../../internal/Observable';
import { withLatestFrom } from '../../internal/patching/operator/withLatestFrom';

Observable.prototype.withLatestFrom = withLatestFrom;

declare module '../../internal/Observable' {
  interface Observable<T> {
    withLatestFrom: typeof withLatestFrom;
  }
}
