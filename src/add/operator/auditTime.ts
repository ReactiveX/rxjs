import {Observable, IObservable} from '../../Observable';
import {auditTime, AuditTimeSignature} from '../../operator/auditTime';

Observable.prototype.auditTime = auditTime;

declare module '../../Observable' {
  interface IObservable<T> {
    auditTime: AuditTimeSignature<T>;
  }
}