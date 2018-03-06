
import { Observable } from 'rxjs';
import { skipUntil } from 'rxjs/internal/patching/operator/skipUntil';

(Observable as any).prototype.skipUntil = skipUntil;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    skipUntil: typeof skipUntil;
  }
}
