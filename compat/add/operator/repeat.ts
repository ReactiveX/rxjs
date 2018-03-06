
import { Observable } from 'rxjs';
import { repeat } from 'rxjs/internal/patching/operator/repeat';

(Observable as any).prototype.repeat = repeat;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    repeat: typeof repeat;
  }
}
