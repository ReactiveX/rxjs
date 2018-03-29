
import { Observable } from 'rxjs';
import { buffer } from '../../operator/buffer';

(Observable as any).prototype.buffer = buffer;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    buffer: typeof buffer;
  }
}
