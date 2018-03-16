
import { Observable } from 'rxjs';
import { last } from 'rxjs/internal-compatibility';

(Observable as any).prototype.last = <any>last;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    last: typeof last;
  }
}
