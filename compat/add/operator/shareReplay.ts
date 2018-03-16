
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/internal-compatibility';

(Observable as any).prototype.shareReplay = shareReplay;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    shareReplay: typeof shareReplay;
  }
}
