
import { Observable } from '../../Observable';
import { observeOn } from '../../internal/patching/operator/observeOn';

Observable.prototype.observeOn = observeOn;

declare module '../../Observable' {
  interface Observable<T> {
    observeOn: typeof observeOn;
  }
}
