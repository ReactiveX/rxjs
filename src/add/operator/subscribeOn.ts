
import { Observable } from '../../Observable';
import { subscribeOn, SubscribeOnSignature } from '../../operator/subscribeOn';

Observable.prototype.subscribeOn = subscribeOn;

declare module '../../Observable' {
  interface Observable<T> {
    subscribeOn: SubscribeOnSignature<T>;
  }
}