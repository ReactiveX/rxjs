
import { Observable } from '../../Observable';
import { sampleTime, SampleTimeSignature } from '../../operator/sampleTime';

Observable.prototype.sampleTime = sampleTime;

declare module '../../Observable' {
  interface Observable<T> {
    sampleTime: SampleTimeSignature<T>;
  }
}