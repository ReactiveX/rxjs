
import { Observable } from 'rxjs';
import { _switch } from '../../operator/switch';

(Observable as any).prototype.switch = _switch;
(Observable as any).prototype._switch = _switch;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    switch: typeof _switch;
    _switch: typeof _switch;
  }
}
