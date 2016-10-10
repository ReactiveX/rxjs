
import { Observable } from '../../Observable';
import { toPromise } from '../../operator/toPromise';

Observable.prototype.toPromise = toPromise;

declare module '../../Observable' {
  interface Observable<T> {
    toPromise: typeof toPromise;
  }
}