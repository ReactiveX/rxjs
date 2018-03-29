import { Observable } from 'rxjs';
import { audit } from '../../operator/audit';

(Observable as any).prototype.audit = audit;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    audit: typeof audit;
  }
}
