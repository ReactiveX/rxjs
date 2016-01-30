import {Observable} from '../../Observable';
import {inspectTime, InspectTimeSignature} from '../../operator/inspectTime';

Observable.prototype.inspectTime = inspectTime;

declare module '../../Observable' {
  interface Observable<T> {
    inspectTime: InspectTimeSignature<T>;
  }
}