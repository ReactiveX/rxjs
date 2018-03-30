
import { Observable } from 'rxjs';
import { withLatestFrom } from '../../operator/withLatestFrom';

(Observable as any).prototype.withLatestFrom = withLatestFrom;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    withLatestFrom: typeof withLatestFrom;
  }
}
