
import { Observable } from '../../Observable';
import { distinctUntilChanged } from '../../internal/patching/operator/distinctUntilChanged';

Observable.prototype.distinctUntilChanged = distinctUntilChanged;

declare module '../../Observable' {
  interface Observable<T> {
    distinctUntilChanged: typeof distinctUntilChanged;
  }
}
