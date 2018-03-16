
import { Observable } from 'rxjs';
import { mergeAll } from 'rxjs/internal-compatibility';

(Observable as any).prototype.mergeAll = mergeAll;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    mergeAll: typeof mergeAll;
  }
}
