
import { Observable } from 'rxjs';
import { concat } from 'rxjs/internal-compatibility';

(Observable as any).prototype.concat = concat;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    concat: typeof concat;
  }
}
