
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/internal-compatibility';

(Observable as any).prototype.timeout = timeout;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    timeout: typeof timeout;
  }
}
