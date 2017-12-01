
import { Observable } from '../../Observable';
import { windowToggle } from '../../internal/patching/operator/windowToggle';

Observable.prototype.windowToggle = windowToggle;

declare module '../../Observable' {
  interface Observable<T> {
    windowToggle: typeof windowToggle;
  }
}
