
import { Observable } from 'rxjs';
import { bufferToggle } from 'rxjs/internal-compatibility';

(Observable as any).prototype.bufferToggle = bufferToggle;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    bufferToggle: typeof bufferToggle;
  }
}
