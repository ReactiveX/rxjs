
import { Observable } from '../../internal/Observable';
import { window } from '../../internal/patching/operator/window';

Observable.prototype.window = window;

declare module '../../internal/Observable' {
  interface Observable<T> {
    window: typeof window;
  }
}
