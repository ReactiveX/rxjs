
import { Observable } from 'rxjs';
import { delayWhen } from 'rxjs/internal/patching/operator/delayWhen';

(Observable as any).prototype.delayWhen = delayWhen;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    delayWhen: typeof delayWhen;
  }
}
