
import { Observable } from 'rxjs';
import { publishBehavior } from 'rxjs/internal-compatibility';

(Observable as any).prototype.publishBehavior = publishBehavior;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    publishBehavior: typeof publishBehavior;
  }
}
