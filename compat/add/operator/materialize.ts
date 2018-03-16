
import { Observable } from 'rxjs';
import { materialize } from 'rxjs/internal-compatibility';

(Observable as any).prototype.materialize = materialize;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    materialize: typeof materialize;
  }
}
