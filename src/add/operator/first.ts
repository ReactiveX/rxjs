
import { Observable } from '../../Observable';
import { first } from '../../internal/patching/operator/first';

Observable.prototype.first = <any>first;

declare module '../../Observable' {
  interface Observable<T> {
    first: typeof first;
  }
}
