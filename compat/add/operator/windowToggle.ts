
import { Observable } from '../../internal/Observable';
import { windowToggle } from '../../internal/patching/operator/windowToggle';

Observable.prototype.windowToggle = windowToggle;

declare module '../../internal/Observable' {
  interface Observable<T> {
    windowToggle: typeof windowToggle;
  }
}
