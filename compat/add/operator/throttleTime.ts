
import { Observable } from 'rxjs';
import { throttleTime } from 'rxjs/internal/patching/operator/throttleTime';

(Observable as any).prototype.throttleTime = throttleTime;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    throttleTime: typeof throttleTime;
  }
}
