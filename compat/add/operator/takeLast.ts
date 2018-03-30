import { Observable } from 'rxjs';
import { takeLast } from '../../operator/takeLast';

(Observable as any).prototype.takeLast = takeLast;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    takeLast: typeof takeLast;
  }
}
