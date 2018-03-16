
import { Observable } from 'rxjs';
import { delay } from 'rxjs/internal-compatibility';

(Observable as any).prototype.delay = delay;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    delay: typeof delay;
  }
}
