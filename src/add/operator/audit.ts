import {Observable, IObservable} from '../../Observable';
import {audit, AuditSignature} from '../../operator/audit';

Observable.prototype.audit = audit;

declare module '../../Observable' {
  interface IObservable<T> {
    audit: AuditSignature<T>;
  }
}