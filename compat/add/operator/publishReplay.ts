
import { Observable } from 'rxjs';
import { publishReplay } from 'rxjs/internal-compatibility';

(Observable as any).prototype.publishReplay = publishReplay;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    publishReplay: typeof publishReplay;
  }
}
