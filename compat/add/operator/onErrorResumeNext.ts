import { Observable } from 'rxjs';
import { onErrorResumeNext } from 'rxjs/internal-compatibility';

(Observable as any).prototype.onErrorResumeNext = onErrorResumeNext;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    onErrorResumeNext: typeof onErrorResumeNext;
  }
}
