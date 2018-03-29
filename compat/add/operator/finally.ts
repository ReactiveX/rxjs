
import { Observable } from 'rxjs';
import { _finally } from '../../operator/finally';

(Observable as any).prototype.finally = _finally;
(Observable as any).prototype._finally = _finally;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    finally: typeof _finally;
    _finally: typeof _finally;
  }
}
