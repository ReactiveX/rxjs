
import { Observable } from 'rxjs';
import { combineAll } from 'rxjs/internal/patching/operator/combineAll';

(Observable as any).prototype.combineAll = combineAll;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    combineAll: typeof combineAll;
  }
}
