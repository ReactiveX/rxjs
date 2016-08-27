
import { Observable } from '../../Observable';
import { partition, PartitionSignature } from '../../operator/partition';

Observable.prototype.partition = partition;

declare module '../../Observable' {
  interface Observable<T> {
    partition: PartitionSignature<T>;
  }
}