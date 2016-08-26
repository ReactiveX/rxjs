import { Observable } from '../../Observable';
import { audit, AuditSignature } from '../../operator/audit';

Observable.prototype.audit = audit;

declare module '../../Observable' {
  interface Observable<T> {
    audit: AuditSignature<T>;
  }
}