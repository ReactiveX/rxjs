
import { Observable } from '../../internal/Observable';
import { share } from '../../internal/patching/operator/share';

Observable.prototype.share = share;

declare module '../../internal/Observable' {
  interface Observable<T> {
    share: typeof share;
  }
}
