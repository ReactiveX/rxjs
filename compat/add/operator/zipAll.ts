
import { Observable } from 'rxjs';
import { zipAll } from 'rxjs/internal-compatibility';

(Observable as any).prototype.zipAll = zipAll;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    zipAll: typeof zipAll;
  }
}
