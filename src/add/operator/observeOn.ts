
import { Observable } from '../../internal/Observable';
import { observeOn } from '../../internal/patching/operator/observeOn';

Observable.prototype.observeOn = observeOn;

declare module '../../internal/Observable' {
  interface Observable<T> {
    observeOn: typeof observeOn;
  }
}
