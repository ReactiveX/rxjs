
import { Observable } from 'rxjs';
import { distinctUntilKeyChanged } from 'rxjs/internal/patching/operator/distinctUntilKeyChanged';

(Observable as any).prototype.distinctUntilKeyChanged = distinctUntilKeyChanged;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    distinctUntilKeyChanged: typeof distinctUntilKeyChanged;
  }
}
