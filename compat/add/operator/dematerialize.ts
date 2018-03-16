
import { Observable } from 'rxjs';
import { dematerialize } from 'rxjs/internal-compatibility';

(Observable as any).prototype.dematerialize = dematerialize;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    dematerialize: typeof dematerialize;
  }
}
