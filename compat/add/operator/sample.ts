
import { Observable } from '../../internal/Observable';
import { sample } from '../../internal/patching/operator/sample';

Observable.prototype.sample = sample;

declare module '../../internal/Observable' {
  interface Observable<T> {
    sample: typeof sample;
  }
}
