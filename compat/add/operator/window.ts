
import { Observable } from 'rxjs';
import { window } from '../../operator/window';

(Observable as any).prototype.window = window;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    window: typeof window;
  }
}
