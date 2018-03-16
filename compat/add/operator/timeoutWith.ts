
import { Observable } from 'rxjs';
import { timeoutWith } from 'rxjs/internal-compatibility';

(Observable as any).prototype.timeoutWith = timeoutWith;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    timeoutWith: typeof timeoutWith;
  }
}
