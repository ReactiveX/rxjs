
import { Observable } from '../../internal/Observable';
import { find } from '../../internal/patching/operator/find';

Observable.prototype.find = find;

declare module '../../internal/Observable' {
  interface Observable<T> {
    find: typeof find;
  }
}
