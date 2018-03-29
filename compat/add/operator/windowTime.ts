
import { Observable } from 'rxjs';
import { windowTime } from '../../operator/windowTime';

(Observable as any).prototype.windowTime = windowTime;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    windowTime: typeof windowTime;
  }
}
