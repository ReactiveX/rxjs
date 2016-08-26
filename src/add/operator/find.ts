
import { Observable } from '../../Observable';
import { find, FindSignature } from '../../operator/find';

Observable.prototype.find = find;

declare module '../../Observable' {
  interface Observable<T> {
    find: FindSignature<T>;
  }
}