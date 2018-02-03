
import { Observable } from '../../internal/Observable';
import { partition } from '../../internal/patching/operator/partition';

Observable.prototype.partition = partition;

declare module '../../internal/Observable' {
  interface Observable<T> {
    partition: typeof partition;
  }
}
