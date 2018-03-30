
import { Observable } from 'rxjs';
import { shareReplay } from '../../operator/shareReplay';

(Observable as any).prototype.shareReplay = shareReplay;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    shareReplay: typeof shareReplay;
  }
}
