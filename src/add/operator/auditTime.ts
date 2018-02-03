import { Observable } from '../../internal/Observable';
import { auditTime } from '../../internal/patching/operator/auditTime';

Observable.prototype.auditTime = auditTime;

declare module '../../internal/Observable' {
  interface Observable<T> {
    auditTime: typeof auditTime;
  }
}
