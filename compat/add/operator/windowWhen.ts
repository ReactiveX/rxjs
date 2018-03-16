
import { Observable } from 'rxjs';
import { windowWhen } from 'rxjs/internal-compatibility';

(Observable as any).prototype.windowWhen = windowWhen;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    windowWhen: typeof windowWhen;
  }
}
