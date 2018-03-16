
import { Observable } from 'rxjs';
import { switchMapTo } from 'rxjs/internal-compatibility';

(Observable as any).prototype.switchMapTo = switchMapTo;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    switchMapTo: typeof switchMapTo;
  }
}
