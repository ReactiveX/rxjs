
import { Observable } from '../../internal/Observable';
import { first } from '../../internal/patching/operator/first';

Observable.prototype.first = <any>first;

declare module '../../internal/Observable' {
  interface Observable<T> {
    first: typeof first;
  }
}
