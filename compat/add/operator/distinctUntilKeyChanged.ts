
import { Observable } from 'rxjs';
import { distinctUntilKeyChanged } from '../../operator/distinctUntilKeyChanged';

(Observable as any).prototype.distinctUntilKeyChanged = distinctUntilKeyChanged;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    distinctUntilKeyChanged: typeof distinctUntilKeyChanged;
  }
}
