
import { Observable } from '../../Observable';
import { take, TakeSignature } from '../../operator/take';

Observable.prototype.take = take;

declare module '../../Observable' {
  interface Observable<T> {
    take: TakeSignature<T>;
  }
}