
import { Observable } from 'rxjs';
import { reduce } from '../../operator/reduce';

(Observable as any).prototype.reduce = reduce;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    reduce: typeof reduce;
  }
}
