
import { Observable } from 'rxjs';
import { map } from '../../operator/map';

(Observable as any).prototype.map = map;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    map: typeof map;
  }
}
