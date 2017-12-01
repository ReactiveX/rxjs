
import { Observable } from '../../Observable';
import { delay } from '../../internal/patching/operator/delay';

Observable.prototype.delay = delay;

declare module '../../Observable' {
  interface Observable<T> {
    delay: typeof delay;
  }
}
