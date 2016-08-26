
import { Observable } from '../../Observable';
import { toPromise, ToPromiseSignature } from '../../operator/toPromise';

Observable.prototype.toPromise = toPromise;

declare module '../../Observable' {
  interface Observable<T> {
    toPromise: ToPromiseSignature<T>;
  }
}