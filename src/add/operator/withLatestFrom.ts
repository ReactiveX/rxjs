
import { Observable } from '../../Observable';
import { withLatestFrom } from '../../internal/patching/operator/withLatestFrom';

Observable.prototype.withLatestFrom = withLatestFrom;

declare module '../../Observable' {
  interface Observable<T> {
    withLatestFrom: typeof withLatestFrom;
  }
}
