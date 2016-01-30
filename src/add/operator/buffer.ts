
import {Observable} from '../../Observable';
import {buffer, BufferSignature} from '../../operator/buffer';

Observable.prototype.buffer = buffer;

declare module '../../Observable' {
  interface Observable<T> {
    buffer: BufferSignature<T>;
  }
}