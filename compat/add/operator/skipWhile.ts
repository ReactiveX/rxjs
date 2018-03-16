
import { Observable } from 'rxjs';
import { skipWhile } from 'rxjs/internal-compatibility';

(Observable as any).prototype.skipWhile = skipWhile;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    skipWhile: typeof skipWhile;
  }
}
