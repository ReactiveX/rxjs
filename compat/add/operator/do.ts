
import { Observable } from 'rxjs';
import { _do } from '../../operator/do';

(Observable as any).prototype.do = _do;
(Observable as any).prototype._do = _do;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    do: typeof _do;
    _do: typeof _do;
  }
}
