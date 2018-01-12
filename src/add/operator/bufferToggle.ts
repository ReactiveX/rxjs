
import { Observable } from '../../internal/Observable';
import { bufferToggle } from '../../internal/patching/operator/bufferToggle';

Observable.prototype.bufferToggle = bufferToggle;

declare module '../../internal/Observable' {
  interface Observable<T> {
    bufferToggle: typeof bufferToggle;
  }
}
