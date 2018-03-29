
import { Observable } from 'rxjs';
import { combineAll } from '../../operator/combineAll';

(Observable as any).prototype.combineAll = combineAll;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    combineAll: typeof combineAll;
  }
}
