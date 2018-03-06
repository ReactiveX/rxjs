import { Observable } from 'rxjs';
import { onErrorResumeNext } from 'rxjs/internal/patching/operator/onErrorResumeNext';

(Observable as any).prototype.onErrorResumeNext = onErrorResumeNext;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    onErrorResumeNext: typeof onErrorResumeNext;
  }
}
