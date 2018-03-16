import { Observable } from 'rxjs';
import { audit } from 'rxjs/internal-compatibility';

(Observable as any).prototype.audit = audit;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    audit: typeof audit;
  }
}
