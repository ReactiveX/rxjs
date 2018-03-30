
import { Observable } from 'rxjs';
import { isEmpty } from '../../operator/isEmpty';

(Observable as any).prototype.isEmpty = isEmpty;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    isEmpty: typeof isEmpty;
  }
}
