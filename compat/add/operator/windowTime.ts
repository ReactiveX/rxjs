
import { Observable } from 'rxjs';
import { windowTime } from 'rxjs/internal-compatibility';

(Observable as any).prototype.windowTime = windowTime;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    windowTime: typeof windowTime;
  }
}
