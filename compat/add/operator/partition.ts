
import { Observable } from 'rxjs';
import { partition } from 'rxjs/internal-compatibility';

(Observable as any).prototype.partition = partition;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    partition: typeof partition;
  }
}
