
import {Observable} from '../../Observable';
import {bufferToggle, BufferToggleSignature} from '../../operator/bufferToggle';

Observable.prototype.bufferToggle = bufferToggle;

declare module '../../Observable' {
  interface Observable<T> {
    bufferToggle: BufferToggleSignature<T>;
  }
}