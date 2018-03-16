
import { Observable } from 'rxjs';
import { throttleTime } from 'rxjs/internal-compatibility';

(Observable as any).prototype.throttleTime = throttleTime;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    throttleTime: typeof throttleTime;
  }
}
