
import { Observable } from '../../Observable';
import { bufferWhen } from '../../internal/patching/operator/bufferWhen';

Observable.prototype.bufferWhen = bufferWhen;

declare module '../../Observable' {
  interface Observable<T> {
    bufferWhen: typeof bufferWhen;
  }
}
