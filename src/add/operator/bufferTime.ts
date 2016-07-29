
import {Observable} from '../../Observable';
import {bufferTime, BufferTimeSignature} from '../../operator/bufferTime';

Observable.prototype.bufferTime = bufferTime;

declare module '../../Observable' {
  interface IObservable<T> {
    bufferTime: BufferTimeSignature<T>;
  }
}