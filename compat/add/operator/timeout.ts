
import { Observable } from 'rxjs';
import { timeout } from '../../operator/timeout';

(Observable as any).prototype.timeout = timeout;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    timeout: typeof timeout;
  }
}
