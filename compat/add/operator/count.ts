
import { Observable } from 'rxjs';
import { count } from 'rxjs/internal-compatibility';

(Observable as any).prototype.count = count;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    count: typeof count;
  }
}
