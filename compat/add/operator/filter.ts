
import { Observable } from 'rxjs';
import { filter } from '../../operator/filter';

(Observable as any).prototype.filter = filter;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    filter: typeof filter;
  }
}
