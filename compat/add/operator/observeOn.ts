
import { Observable } from 'rxjs';
import { observeOn } from 'rxjs/internal/patching/operator/observeOn';

(Observable as any).prototype.observeOn = observeOn;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    observeOn: typeof observeOn;
  }
}
