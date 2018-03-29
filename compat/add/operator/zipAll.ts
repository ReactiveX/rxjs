
import { Observable } from 'rxjs';
import { zipAll } from '../../operator/zipAll';

(Observable as any).prototype.zipAll = zipAll;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    zipAll: typeof zipAll;
  }
}
