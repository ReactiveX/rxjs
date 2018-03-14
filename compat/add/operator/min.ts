
import { Observable } from 'rxjs';
import { min } from 'rxjs/internal-compatibility';

(Observable as any).prototype.min = min;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    min: typeof min;
  }
}
