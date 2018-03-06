
import { Observable } from 'rxjs';
import { windowToggle } from 'rxjs/internal/patching/operator/windowToggle';

(Observable as any).prototype.windowToggle = windowToggle;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    windowToggle: typeof windowToggle;
  }
}
