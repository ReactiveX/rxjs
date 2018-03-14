
import { Observable } from 'rxjs';
import { bufferCount } from 'rxjs/internal-compatibility';

(Observable as any).prototype.bufferCount = bufferCount;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    bufferCount: typeof bufferCount;
  }
}
