
import { Observable } from '../../internal/Observable';
import { defaultIfEmpty } from '../../internal/patching/operator/defaultIfEmpty';

Observable.prototype.defaultIfEmpty = defaultIfEmpty;

declare module '../../internal/Observable' {
  interface Observable<T> {
    defaultIfEmpty: typeof defaultIfEmpty;
  }
}
