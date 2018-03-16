
import { Observable } from 'rxjs';
import { max } from 'rxjs/internal-compatibility';

(Observable as any).prototype.max = max;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    max: typeof max;
  }
}
