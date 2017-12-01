
import { Observable } from '../../Observable';
import { window } from '../../internal/patching/operator/window';

Observable.prototype.window = window;

declare module '../../Observable' {
  interface Observable<T> {
    window: typeof window;
  }
}
