
import { Observable } from 'rxjs';
import { groupBy } from 'rxjs/internal/patching/operator/groupBy';

(Observable as any).prototype.groupBy = <any>groupBy;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    groupBy: typeof groupBy;
  }
}
