import { Observable } from 'rxjs';
import { audit } from 'rxjs/internal/patching/operator/audit';

(Observable as any).prototype.audit = audit;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    audit: typeof audit;
  }
}
