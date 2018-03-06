
import { Observable } from 'rxjs';
import { min } from 'rxjs/internal/patching/operator/min';

(Observable as any).prototype.min = min;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    min: typeof min;
  }
}
