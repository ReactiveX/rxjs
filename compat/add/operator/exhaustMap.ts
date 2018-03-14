
import { Observable } from 'rxjs';
import { exhaustMap } from 'rxjs/internal-compatibility';

(Observable as any).prototype.exhaustMap = exhaustMap;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    exhaustMap: typeof exhaustMap;
  }
}
