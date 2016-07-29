
import {Observable, IObservable} from '../../Observable';
import {buffer, BufferSignature} from '../../operator/buffer';

Observable.prototype.buffer = buffer;

declare module '../../Observable' {
  interface IObservable<T> {
    buffer: BufferSignature<T>;
  }
}