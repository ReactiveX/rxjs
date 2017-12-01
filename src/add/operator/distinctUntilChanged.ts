
import { Observable } from '../../internal/Observable';
import { distinctUntilChanged } from '../../internal/patching/operator/distinctUntilChanged';

Observable.prototype.distinctUntilChanged = distinctUntilChanged;

declare module '../../internal/Observable' {
  interface Observable<T> {
    distinctUntilChanged: typeof distinctUntilChanged;
  }
}
