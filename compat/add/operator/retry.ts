
import { Observable } from 'rxjs';
import { retry } from '../../operator/retry';

(Observable as any).prototype.retry = retry;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    retry: typeof retry;
  }
}
