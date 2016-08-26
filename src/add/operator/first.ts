
import { Observable } from '../../Observable';
import { first, FirstSignature } from '../../operator/first';

Observable.prototype.first = <any>first;

declare module '../../Observable' {
  interface Observable<T> {
    first: FirstSignature<T>;
  }
}