
import { Observable } from '../../internal/Observable';
import { bufferTime } from '../../internal/patching/operator/bufferTime';

Observable.prototype.bufferTime = bufferTime;

declare module '../../internal/Observable' {
  interface Observable<T> {
    bufferTime: typeof bufferTime;
  }
}
