
import { Observable } from 'rxjs';
import { max } from '../../operator/max';

(Observable as any).prototype.max = max;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    max: typeof max;
  }
}
