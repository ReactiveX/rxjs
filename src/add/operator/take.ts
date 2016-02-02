
import {Observable} from '../../Observable';
import {take} from '../../operator/take';

Observable.prototype.take = take;

declare module '../../Observable' {
  interface Observable<T> {
    take: (count: number) => Observable<T>;
  }
}