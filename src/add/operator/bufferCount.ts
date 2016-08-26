
import { Observable } from '../../Observable';
import { bufferCount, BufferCountSignature } from '../../operator/bufferCount';

Observable.prototype.bufferCount = bufferCount;

declare module '../../Observable' {
  interface Observable<T> {
    bufferCount: BufferCountSignature<T>;
  }
}