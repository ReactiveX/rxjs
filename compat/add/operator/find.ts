
import { Observable } from 'rxjs';
import { find } from 'rxjs/internal/patching/operator/find';

(Observable as any).prototype.find = find;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    find: typeof find;
  }
}
