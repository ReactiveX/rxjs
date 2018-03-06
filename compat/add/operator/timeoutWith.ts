
import { Observable } from 'rxjs';
import { timeoutWith } from 'rxjs/internal/patching/operator/timeoutWith';

(Observable as any).prototype.timeoutWith = timeoutWith;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    timeoutWith: typeof timeoutWith;
  }
}
