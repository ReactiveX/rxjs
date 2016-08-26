
import { Observable } from '../../Observable';
import { exhaustMap, SwitchFirstMapSignature } from '../../operator/exhaustMap';

Observable.prototype.exhaustMap = exhaustMap;

declare module '../../Observable' {
  interface Observable<T> {
    exhaustMap: SwitchFirstMapSignature<T>;
  }
}