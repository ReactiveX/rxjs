
import { Observable } from 'rxjs';
import { concatMap } from '../../operator/concatMap';

(Observable as any).prototype.concatMap = concatMap;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    concatMap: typeof concatMap;
  }
}
