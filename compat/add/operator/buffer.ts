
import { Observable } from 'rxjs';
import { buffer } from 'rxjs/internal/patching/operator/buffer';

(Observable as any).prototype.buffer = buffer;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    buffer: typeof buffer;
  }
}
