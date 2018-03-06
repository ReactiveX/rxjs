
import { Observable } from 'rxjs';
import { exhaust } from 'rxjs/internal/patching/operator/exhaust';

(Observable as any).prototype.exhaust = exhaust;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    exhaust: typeof exhaust;
  }
}
