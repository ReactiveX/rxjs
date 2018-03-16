
import { Observable } from 'rxjs';
import { elementAt } from 'rxjs/internal-compatibility';

(Observable as any).prototype.elementAt = elementAt;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    elementAt: typeof elementAt;
  }
}
