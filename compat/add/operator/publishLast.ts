
import { Observable } from 'rxjs';
import { publishLast } from '../../operator/publishLast';

(Observable as any).prototype.publishLast = publishLast;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    publishLast: typeof publishLast;
  }
}
