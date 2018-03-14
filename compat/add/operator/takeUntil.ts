
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/internal-compatibility';

(Observable as any).prototype.takeUntil = takeUntil;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    takeUntil: typeof takeUntil;
  }
}
