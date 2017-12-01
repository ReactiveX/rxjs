
import { Observable } from '../../internal/Observable';
import { filter } from '../../internal/patching/operator/filter';

Observable.prototype.filter = filter;

declare module '../../internal/Observable' {
  interface Observable<T> {
    filter: typeof filter;
  }
}
