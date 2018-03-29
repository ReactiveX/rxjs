
import { Observable } from 'rxjs';
import { groupBy } from '../../operator/groupBy';

(Observable as any).prototype.groupBy = <any>groupBy;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    groupBy: typeof groupBy;
  }
}
