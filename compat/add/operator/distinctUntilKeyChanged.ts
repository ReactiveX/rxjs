
import { Observable } from 'rxjs';
import { distinctUntilKeyChanged } from 'rxjs/internal-compatibility';

(Observable as any).prototype.distinctUntilKeyChanged = distinctUntilKeyChanged;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    distinctUntilKeyChanged: typeof distinctUntilKeyChanged;
  }
}
