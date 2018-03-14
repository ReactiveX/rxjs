
import { Observable } from 'rxjs';
import { mapTo } from 'rxjs/internal-compatibility';

(Observable as any).prototype.mapTo = mapTo;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    mapTo: typeof mapTo;
  }
}
