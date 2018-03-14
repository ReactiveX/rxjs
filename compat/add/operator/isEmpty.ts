
import { Observable } from 'rxjs';
import { isEmpty } from 'rxjs/internal-compatibility';

(Observable as any).prototype.isEmpty = isEmpty;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    isEmpty: typeof isEmpty;
  }
}
