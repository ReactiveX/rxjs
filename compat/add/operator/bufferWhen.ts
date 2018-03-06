
import { Observable } from 'rxjs';
import { bufferWhen } from 'rxjs/internal/patching/operator/bufferWhen';

(Observable as any).prototype.bufferWhen = bufferWhen;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    bufferWhen: typeof bufferWhen;
  }
}
