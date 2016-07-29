
import {Observable} from '../../Observable';
import {bufferWhen, BufferWhenSignature} from '../../operator/bufferWhen';

Observable.prototype.bufferWhen = bufferWhen;

declare module '../../Observable' {
  interface IObservable<T> {
    bufferWhen: BufferWhenSignature<T>;
  }
}