
import { Observable } from 'rxjs';
import { exhaustMap } from '../../operator/exhaustMap';

(Observable as any).prototype.exhaustMap = exhaustMap;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    exhaustMap: typeof exhaustMap;
  }
}
