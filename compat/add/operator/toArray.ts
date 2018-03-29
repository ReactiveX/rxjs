
import { Observable } from 'rxjs';
import { toArray } from '../../operator/toArray';

(Observable as any).prototype.toArray = toArray;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    toArray: typeof toArray;
  }
}
