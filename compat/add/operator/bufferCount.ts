
import { Observable } from 'rxjs';
import { bufferCount } from '../../operator/bufferCount';

(Observable as any).prototype.bufferCount = bufferCount;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    bufferCount: typeof bufferCount;
  }
}
