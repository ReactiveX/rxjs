
import { Observable } from 'rxjs';
import { observeOn } from '../../operator/observeOn';

(Observable as any).prototype.observeOn = observeOn;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    observeOn: typeof observeOn;
  }
}
