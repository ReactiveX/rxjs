
import {Observable} from '../../Observable';
import {bufferTime, BufferTimeSignature} from '../../operator/bufferTime';

Observable.prototype.bufferTime = bufferTime;

declare module '../../Observable' {
  interface Observable<T> {
    bufferTime: BufferTimeSignature<T>;
  }
}