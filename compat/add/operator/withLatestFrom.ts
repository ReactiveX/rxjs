
import { Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/internal-compatibility';

(Observable as any).prototype.withLatestFrom = withLatestFrom;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    withLatestFrom: typeof withLatestFrom;
  }
}
