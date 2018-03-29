
import { Observable } from 'rxjs';
import { windowCount } from '../../operator/windowCount';

(Observable as any).prototype.windowCount = windowCount;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    windowCount: typeof windowCount;
  }
}
