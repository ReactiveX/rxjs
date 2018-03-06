
import { Observable } from 'rxjs';
import { concat } from 'rxjs/internal/patching/operator/concat';

(Observable as any).prototype.concat = concat;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    concat: typeof concat;
  }
}
