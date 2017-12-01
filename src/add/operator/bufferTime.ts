
import { Observable } from '../../Observable';
import { bufferTime } from '../../internal/patching/operator/bufferTime';

Observable.prototype.bufferTime = bufferTime;

declare module '../../Observable' {
  interface Observable<T> {
    bufferTime: typeof bufferTime;
  }
}
