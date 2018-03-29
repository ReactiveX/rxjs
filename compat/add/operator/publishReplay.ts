
import { Observable } from 'rxjs';
import { publishReplay } from '../../operator/publishReplay';

(Observable as any).prototype.publishReplay = publishReplay;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    publishReplay: typeof publishReplay;
  }
}
