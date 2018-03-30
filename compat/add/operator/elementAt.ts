
import { Observable } from 'rxjs';
import { elementAt } from '../../operator/elementAt';

(Observable as any).prototype.elementAt = elementAt;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    elementAt: typeof elementAt;
  }
}
