
import { Observable } from 'rxjs';
import { takeUntil } from '../../operator/takeUntil';

(Observable as any).prototype.takeUntil = takeUntil;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    takeUntil: typeof takeUntil;
  }
}
