import { Observable } from 'rxjs';
import { auditTime } from 'rxjs/internal-compatibility';

(Observable as any).prototype.auditTime = auditTime;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    auditTime: typeof auditTime;
  }
}
