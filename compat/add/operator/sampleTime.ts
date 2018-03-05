
import { Observable } from '../../internal/Observable';
import { sampleTime } from '../../internal/patching/operator/sampleTime';

Observable.prototype.sampleTime = sampleTime;

declare module '../../internal/Observable' {
  interface Observable<T> {
    sampleTime: typeof sampleTime;
  }
}
