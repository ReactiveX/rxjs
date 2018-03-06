
import { Observable } from 'rxjs';
import { combineLatest } from 'rxjs/internal/patching/operator/combineLatest';

(Observable as any).prototype.combineLatest = combineLatest;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    combineLatest: typeof combineLatest;
  }
}
