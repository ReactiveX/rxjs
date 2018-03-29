
import { Observable } from 'rxjs';
import { mergeAll } from '../../operator/mergeAll';

(Observable as any).prototype.mergeAll = mergeAll;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    mergeAll: typeof mergeAll;
  }
}
