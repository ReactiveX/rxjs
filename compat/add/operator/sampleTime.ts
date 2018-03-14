
import { Observable } from 'rxjs';
import { sampleTime } from 'rxjs/internal-compatibility';

(Observable as any).prototype.sampleTime = sampleTime;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    sampleTime: typeof sampleTime;
  }
}
