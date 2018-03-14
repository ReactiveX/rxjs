
import { Observable } from 'rxjs';
import { bufferTime } from 'rxjs/internal-compatibility';

(Observable as any).prototype.bufferTime = bufferTime;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    bufferTime: typeof bufferTime;
  }
}
