
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/internal-compatibility';

(Observable as any).prototype.startWith = startWith;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    startWith: typeof startWith;
  }
}
