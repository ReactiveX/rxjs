
import { Observable } from '../../Observable';
import { defaultIfEmpty } from '../../internal/patching/operator/defaultIfEmpty';

Observable.prototype.defaultIfEmpty = defaultIfEmpty;

declare module '../../Observable' {
  interface Observable<T> {
    defaultIfEmpty: typeof defaultIfEmpty;
  }
}
