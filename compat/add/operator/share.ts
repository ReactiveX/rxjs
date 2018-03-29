
import { Observable } from 'rxjs';
import { share } from '../../operator/share';

(Observable as any).prototype.share = share;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    share: typeof share;
  }
}
