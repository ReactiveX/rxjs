
import { Observable } from '../../internal/Observable';
import { switchMapTo } from '../../internal/patching/operator/switchMapTo';

Observable.prototype.switchMapTo = switchMapTo;

declare module '../../internal/Observable' {
  interface Observable<T> {
    switchMapTo: typeof switchMapTo;
  }
}
