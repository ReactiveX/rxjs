
import {Observable} from '../../Observable';
import {groupBy, GroupedObservable} from '../../operator/groupBy';

Observable.prototype.groupBy = groupBy;

declare module '../../Observable' {
  interface Observable<T> {
    groupBy: <K, R>(keySelector: (value: T) => K,
      elementSelector?: (value: T) => R,
      durationSelector?: (group: GroupedObservable<K, R>) => Observable<any>) => Observable<GroupedObservable<K, R>>;
  }
}