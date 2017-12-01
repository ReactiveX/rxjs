
import { Observable } from '../../Observable';
import { sampleTime } from '../../internal/patching/operator/sampleTime';

Observable.prototype.sampleTime = sampleTime;

declare module '../../Observable' {
  interface Observable<T> {
    sampleTime: typeof sampleTime;
  }
}
