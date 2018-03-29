
import { Observable } from 'rxjs';
import { pluck } from '../../operator/pluck';

(Observable as any).prototype.pluck = pluck;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    pluck: typeof pluck;
  }
}
