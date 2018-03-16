
import { Observable } from 'rxjs';
import { find } from 'rxjs/internal-compatibility';

(Observable as any).prototype.find = find;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    find: typeof find;
  }
}
