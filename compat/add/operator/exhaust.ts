
import { Observable } from 'rxjs';
import { exhaust } from '../../operator/exhaust';

(Observable as any).prototype.exhaust = exhaust;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    exhaust: typeof exhaust;
  }
}
