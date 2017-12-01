
import { Observable } from '../../Observable';
import { share } from '../../internal/patching/operator/share';

Observable.prototype.share = share;

declare module '../../Observable' {
  interface Observable<T> {
    share: typeof share;
  }
}
