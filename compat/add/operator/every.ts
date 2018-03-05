
import { Observable } from '../../internal/Observable';
import { every } from '../../internal/patching/operator/every';

Observable.prototype.every = every;

declare module '../../internal/Observable' {
  interface Observable<T> {
    every: typeof every;
  }
}
