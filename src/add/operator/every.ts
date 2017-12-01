
import { Observable } from '../../Observable';
import { every } from '../../internal/patching/operator/every';

Observable.prototype.every = every;

declare module '../../Observable' {
  interface Observable<T> {
    every: typeof every;
  }
}
