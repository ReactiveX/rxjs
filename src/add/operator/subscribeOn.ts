
import { Observable } from '../../Observable';
import { subscribeOn } from '../../internal/patching/operator/subscribeOn';

Observable.prototype.subscribeOn = subscribeOn;

declare module '../../Observable' {
  interface Observable<T> {
    subscribeOn: typeof subscribeOn;
  }
}
