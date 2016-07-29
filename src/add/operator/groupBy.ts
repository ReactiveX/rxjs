
import {Observable} from '../../Observable';
import {groupBy, GroupBySignature} from '../../operator/groupBy';

Observable.prototype.groupBy = <any>groupBy;

declare module '../../Observable' {
  interface IObservable<T> {
    groupBy: GroupBySignature<T>;
  }
}