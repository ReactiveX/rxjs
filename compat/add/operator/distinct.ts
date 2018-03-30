import { Observable } from 'rxjs';
import { distinct } from '../../operator/distinct';

(Observable as any).prototype.distinct = distinct;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    distinct: typeof distinct;
  }
}
