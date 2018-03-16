
import { Observable } from 'rxjs';
import { pairwise } from 'rxjs/internal-compatibility';

(Observable as any).prototype.pairwise = pairwise;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    pairwise: typeof pairwise;
  }
}
