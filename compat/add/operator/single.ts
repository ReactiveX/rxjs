
import { Observable } from 'rxjs';
import { single } from 'rxjs/internal/patching/operator/single';

(Observable as any).prototype.single = single;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    single: typeof single;
  }
}
