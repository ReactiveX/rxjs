
import { Observable } from 'rxjs';
import { repeatWhen } from '../../operator/repeatWhen';

(Observable as any).prototype.repeatWhen = repeatWhen;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    repeatWhen: typeof repeatWhen;
  }
}
