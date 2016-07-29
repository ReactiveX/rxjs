
import {Observable} from '../../Observable';
import {cache, CacheSignature} from '../../operator/cache';

Observable.prototype.cache = cache;

declare module '../../Observable' {
  interface IObservable<T> {
    cache: CacheSignature<T>;
  }
}