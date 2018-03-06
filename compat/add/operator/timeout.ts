
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/internal/patching/operator/timeout';

(Observable as any).prototype.timeout = timeout;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    timeout: typeof timeout;
  }
}
