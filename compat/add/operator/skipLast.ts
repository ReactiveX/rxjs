import { Observable } from 'rxjs';
import { skipLast } from '../../operator/skipLast';

(Observable as any).prototype.skipLast = skipLast;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    skipLast: typeof skipLast;
  }
}
