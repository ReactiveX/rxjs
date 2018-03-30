
import { Observable } from 'rxjs';
import { partition } from '../../operator/partition';

(Observable as any).prototype.partition = partition;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    partition: typeof partition;
  }
}
