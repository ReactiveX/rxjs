import {Observable} from '../../Observable';
import {inspect, InspectSignature} from '../../operator/inspect';

Observable.prototype.inspect = inspect;

declare module '../../Observable' {
  interface Observable<T> {
    inspect: InspectSignature<T>;
  }
}