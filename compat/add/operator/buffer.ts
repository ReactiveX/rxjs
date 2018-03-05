
import { Observable } from '../../internal/Observable';
import { buffer } from '../../internal/patching/operator/buffer';

Observable.prototype.buffer = buffer;

declare module '../../internal/Observable' {
  interface Observable<T> {
    buffer: typeof buffer;
  }
}
