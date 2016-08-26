
import { Observable } from '../../Observable';
import { exhaust, SwitchFirstSignature } from '../../operator/exhaust';

Observable.prototype.exhaust = exhaust;

declare module '../../Observable' {
  interface Observable<T> {
    exhaust: SwitchFirstSignature<T>;
  }
}