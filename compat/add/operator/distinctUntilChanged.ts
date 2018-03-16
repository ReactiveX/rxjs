
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/internal-compatibility';

(Observable as any).prototype.distinctUntilChanged = distinctUntilChanged;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    distinctUntilChanged: typeof distinctUntilChanged;
  }
}
