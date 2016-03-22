import {Observable} from '../../Observable';
import {auditTime, AuditTimeSignature} from '../../operator/auditTime';

Observable.prototype.auditTime = auditTime;

declare module '../../Observable' {
  interface Observable<T> {
    auditTime: AuditTimeSignature<T>;
  }
}