import { Observable } from '../../Observable';
import { smooth } from '../../operator/smooth';

Observable.prototype.smooth = smooth;

declare module '../../Observable' {
  interface Observable<T> {
    smooth: typeof smooth;
  }
}
