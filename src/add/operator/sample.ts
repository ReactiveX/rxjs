
import {Observable} from '../../Observable';
import {sample, SampleSignature} from '../../operator/sample';

Observable.prototype.sample = sample;

declare module '../../Observable' {
  interface IObservable<T> {
    sample: SampleSignature<T>;
  }
}