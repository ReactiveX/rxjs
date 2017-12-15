
import { Observable } from '../../internal/Observable';
import { delay } from '../../internal/patching/operator/delay';

Observable.prototype.delay = delay;

declare module '../../internal/Observable' {
  interface Observable<T> {
    delay: typeof delay;
  }
}
