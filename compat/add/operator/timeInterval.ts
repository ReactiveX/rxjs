
import { Observable } from 'rxjs';
import { timeInterval } from '../../operator/timeInterval';

(Observable as any).prototype.timeInterval = timeInterval;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    timeInterval: typeof timeInterval;
  }
}
