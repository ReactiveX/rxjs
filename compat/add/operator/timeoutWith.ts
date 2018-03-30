
import { Observable } from 'rxjs';
import { timeoutWith } from '../../operator/timeoutWith';

(Observable as any).prototype.timeoutWith = timeoutWith;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    timeoutWith: typeof timeoutWith;
  }
}
