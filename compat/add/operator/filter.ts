
import { Observable } from 'rxjs';
import { filter } from 'rxjs/internal-compatibility';

(Observable as any).prototype.filter = filter;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    filter: typeof filter;
  }
}
