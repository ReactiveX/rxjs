
import { Observable } from 'rxjs';
import { concatMapTo } from '../../operator/concatMapTo';

(Observable as any).prototype.concatMapTo = concatMapTo;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    concatMapTo: typeof concatMapTo;
  }
}
