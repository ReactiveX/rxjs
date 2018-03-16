import { Observable } from 'rxjs';
import { timestamp } from 'rxjs/internal-compatibility';

(Observable as any).prototype.timestamp = timestamp;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    timestamp: typeof timestamp;
  }
}
