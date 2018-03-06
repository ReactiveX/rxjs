
import { Observable } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/internal/patching/operator/defaultIfEmpty';

(Observable as any).prototype.defaultIfEmpty = defaultIfEmpty;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    defaultIfEmpty: typeof defaultIfEmpty;
  }
}
