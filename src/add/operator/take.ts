
import { Observable } from '../../internal/Observable';
import { take } from '../../internal/patching/operator/take';

Observable.prototype.take = take;

declare module '../../internal/Observable' {
  interface Observable<T> {
    take: typeof take;
  }
}
