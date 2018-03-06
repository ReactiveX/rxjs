
import { Observable } from 'rxjs';
import { subscribeOn } from 'rxjs/internal/patching/operator/subscribeOn';

(Observable as any).prototype.subscribeOn = subscribeOn;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    subscribeOn: typeof subscribeOn;
  }
}
