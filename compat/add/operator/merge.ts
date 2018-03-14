
import { Observable } from 'rxjs';
import { merge } from 'rxjs/internal-compatibility';

(Observable as any).prototype.merge = merge;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    merge: typeof merge;
  }
}
