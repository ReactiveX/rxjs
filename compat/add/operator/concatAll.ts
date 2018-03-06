
import { Observable } from 'rxjs';
import { concatAll } from 'rxjs/internal/patching/operator/concatAll';

(Observable as any).prototype.concatAll = concatAll;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    concatAll: typeof concatAll;
  }
}
