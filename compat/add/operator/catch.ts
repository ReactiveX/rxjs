
import { Observable } from 'rxjs';
import { _catch } from '../../operator/catch';

(Observable as any).prototype.catch = _catch;
(Observable as any).prototype._catch = _catch;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    catch: typeof _catch;
    _catch: typeof _catch;
  }
}
