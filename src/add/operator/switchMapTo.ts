
import { Observable } from '../../Observable';
import { switchMapTo } from '../../internal/patching/operator/switchMapTo';

Observable.prototype.switchMapTo = switchMapTo;

declare module '../../Observable' {
  interface Observable<T> {
    switchMapTo: typeof switchMapTo;
  }
}
