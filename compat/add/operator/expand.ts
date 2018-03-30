
import { Observable } from 'rxjs';
import { expand } from '../../operator/expand';

(Observable as any).prototype.expand = expand;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    expand: typeof expand;
  }
}
