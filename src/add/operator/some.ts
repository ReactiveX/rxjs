
import { Observable } from '../../Observable';
import { some } from '../../operator/some';

Observable.prototype.some = some;

declare module '../../Observable' {
  interface Observable<T> {
    some: typeof some;
  }
}