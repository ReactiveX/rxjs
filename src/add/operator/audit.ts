import { Observable } from '../../internal/Observable';
import { audit } from '../../internal/patching/operator/audit';

Observable.prototype.audit = audit;

declare module '../../internal/Observable' {
  interface Observable<T> {
    audit: typeof audit;
  }
}
