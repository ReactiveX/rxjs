
import { Observable } from '../../internal/Observable';
import { bufferWhen } from '../../internal/patching/operator/bufferWhen';

Observable.prototype.bufferWhen = bufferWhen;

declare module '../../internal/Observable' {
  interface Observable<T> {
    bufferWhen: typeof bufferWhen;
  }
}
