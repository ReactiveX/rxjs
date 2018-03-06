
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/internal/patching/operator/takeUntil';

(Observable as any).prototype.takeUntil = takeUntil;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    takeUntil: typeof takeUntil;
  }
}
