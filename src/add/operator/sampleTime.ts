
import {Observable, IObservable} from '../../Observable';
import {sampleTime, SampleTimeSignature} from '../../operator/sampleTime';

Observable.prototype.sampleTime = sampleTime;

declare module '../../Observable' {
  interface IObservable<T> {
    sampleTime: SampleTimeSignature<T>;
  }
}