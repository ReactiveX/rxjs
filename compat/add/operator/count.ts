
import { Observable } from 'rxjs';
import { count } from '../../operator/count';

(Observable as any).prototype.count = count;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    count: typeof count;
  }
}
