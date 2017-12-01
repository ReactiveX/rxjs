import { Observable } from '../../Observable';
import { auditTime } from '../../internal/patching/operator/auditTime';

Observable.prototype.auditTime = auditTime;

declare module '../../Observable' {
  interface Observable<T> {
    auditTime: typeof auditTime;
  }
}
