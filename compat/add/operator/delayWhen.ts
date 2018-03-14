
import { Observable } from 'rxjs';
import { delayWhen } from 'rxjs/internal-compatibility';

(Observable as any).prototype.delayWhen = delayWhen;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    delayWhen: typeof delayWhen;
  }
}
