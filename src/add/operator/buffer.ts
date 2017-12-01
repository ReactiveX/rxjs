
import { Observable } from '../../Observable';
import { buffer } from '../../internal/patching/operator/buffer';

Observable.prototype.buffer = buffer;

declare module '../../Observable' {
  interface Observable<T> {
    buffer: typeof buffer;
  }
}
