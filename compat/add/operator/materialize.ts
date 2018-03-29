
import { Observable } from 'rxjs';
import { materialize } from '../../operator/materialize';

(Observable as any).prototype.materialize = materialize;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    materialize: typeof materialize;
  }
}
