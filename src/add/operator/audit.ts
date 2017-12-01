import { Observable } from '../../Observable';
import { audit } from '../../internal/patching/operator/audit';

Observable.prototype.audit = audit;

declare module '../../Observable' {
  interface Observable<T> {
    audit: typeof audit;
  }
}
