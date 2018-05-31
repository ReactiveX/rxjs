import { Observable } from 'rxjs';
import { timestamp } from '../../operator/timestamp';

(Observable as any).prototype.timestamp = timestamp;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    timestamp: typeof timestamp;
  }
}
