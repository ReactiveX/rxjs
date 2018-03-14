
import { Observable } from 'rxjs';
import { single } from 'rxjs/internal-compatibility';

(Observable as any).prototype.single = single;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    single: typeof single;
  }
}
