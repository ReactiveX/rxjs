
import { Observable } from '../../internal/Observable';
import { shareReplay } from '../../internal/patching/operator/shareReplay';

Observable.prototype.shareReplay = shareReplay;

declare module '../../internal/Observable' {
  interface Observable<T> {
    shareReplay: typeof shareReplay;
  }
}
