import { Observable } from '../../Observable';
import { shareResults } from '../../operator/shareResults';

Observable.prototype.shareResults = shareResults;

declare module '../../Observable' {
  interface Observable<T> {
    shareResults: typeof shareResults;
  }
}