
import { Observable } from 'rxjs';
import { pairwise } from '../../operator/pairwise';

(Observable as any).prototype.pairwise = pairwise;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    pairwise: typeof pairwise;
  }
}
