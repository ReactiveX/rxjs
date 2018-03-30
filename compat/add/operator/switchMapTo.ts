
import { Observable } from 'rxjs';
import { switchMapTo } from '../../operator/switchMapTo';

(Observable as any).prototype.switchMapTo = switchMapTo;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    switchMapTo: typeof switchMapTo;
  }
}
