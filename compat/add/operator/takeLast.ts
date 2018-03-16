import { Observable } from 'rxjs';
import { takeLast } from 'rxjs/internal-compatibility';

(Observable as any).prototype.takeLast = takeLast;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    takeLast: typeof takeLast;
  }
}
