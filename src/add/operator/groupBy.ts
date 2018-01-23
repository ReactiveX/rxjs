
import { Observable } from '../../internal/Observable';
import { groupBy } from '../../internal/patching/operator/groupBy';

Observable.prototype.groupBy = <any>groupBy;

declare module '../../internal/Observable' {
  interface Observable<T> {
    groupBy: typeof groupBy;
  }
}
