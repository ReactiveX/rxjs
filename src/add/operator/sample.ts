
import { Observable } from '../../Observable';
import { sample, SampleSignature } from '../../operator/sample';

Observable.prototype.sample = sample;

declare module '../../Observable' {
  interface Observable<T> {
    sample: SampleSignature<T>;
  }
}