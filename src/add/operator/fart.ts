
import { Observable } from '../../Observable';
import { fart } from '../../operator/fart';

Observable.prototype.fart = fart;

declare module '../../Observable' {
  interface Observable<T> {
    fart: typeof fart;
  }
}