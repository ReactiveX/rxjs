
import { Observable } from '../../Observable';
import { throwIfEmpty } from '../../operator/throwIfEmpty';

Observable.prototype.throwIfEmpty = throwIfEmpty;

declare module '../../Observable' {
  interface Observable<T> {
    throwIfEmpty: typeof throwIfEmpty;
  }
}