
import {Observable} from '../../Observable';
import {filter, FilterSignature} from '../../operator/filter';

Observable.prototype.filter = filter;

declare module '../../Observable' {
  interface Observable<T> {
    filter: FilterSignature<T>;
  }
}