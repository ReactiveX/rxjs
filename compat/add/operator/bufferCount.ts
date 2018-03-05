
import { Observable } from '../../internal/Observable';
import { bufferCount } from '../../internal/patching/operator/bufferCount';

Observable.prototype.bufferCount = bufferCount;

declare module '../../internal/Observable' {
  interface Observable<T> {
    bufferCount: typeof bufferCount;
  }
}
