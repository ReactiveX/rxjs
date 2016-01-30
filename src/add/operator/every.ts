
import {Observable} from '../../Observable';
import {every, EverySignature} from '../../operator/every';

Observable.prototype.every = every;

declare module '../../Observable' {
  interface Observable<T> {
    every: EverySignature<T>;
  }
}