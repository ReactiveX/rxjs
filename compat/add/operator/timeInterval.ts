
import { Observable } from 'rxjs';
import { timeInterval } from 'rxjs/internal-compatibility';

(Observable as any).prototype.timeInterval = timeInterval;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    timeInterval: typeof timeInterval;
  }
}
