
import { Observable } from '../../Observable';
import { bufferWhen, BufferWhenSignature } from '../../operator/bufferWhen';

Observable.prototype.bufferWhen = bufferWhen;

declare module '../../Observable' {
  interface Observable<T> {
    bufferWhen: BufferWhenSignature<T>;
  }
}