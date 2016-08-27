
import { Observable } from '../../Observable';
import { observeOn, ObserveOnSignature } from '../../operator/observeOn';

Observable.prototype.observeOn = observeOn;

declare module '../../Observable' {
  interface Observable<T> {
    observeOn: ObserveOnSignature<T>;
  }
}