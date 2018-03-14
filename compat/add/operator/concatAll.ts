
import { Observable } from 'rxjs';
import { concatAll } from 'rxjs/internal-compatibility';

(Observable as any).prototype.concatAll = concatAll;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    concatAll: typeof concatAll;
  }
}
