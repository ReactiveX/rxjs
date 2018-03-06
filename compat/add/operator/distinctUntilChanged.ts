
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/internal/patching/operator/distinctUntilChanged';

(Observable as any).prototype.distinctUntilChanged = distinctUntilChanged;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    distinctUntilChanged: typeof distinctUntilChanged;
  }
}
