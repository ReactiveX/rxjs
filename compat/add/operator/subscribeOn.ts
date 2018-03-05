
import { Observable } from '../../internal/Observable';
import { subscribeOn } from '../../internal/patching/operator/subscribeOn';

Observable.prototype.subscribeOn = subscribeOn;

declare module '../../internal/Observable' {
  interface Observable<T> {
    subscribeOn: typeof subscribeOn;
  }
}
