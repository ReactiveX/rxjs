
import { Observable } from '../../Observable';
import { find } from '../../internal/patching/operator/find';

Observable.prototype.find = find;

declare module '../../Observable' {
  interface Observable<T> {
    find: typeof find;
  }
}
