
import { Observable } from '../../internal/Observable';
import { distinctUntilKeyChanged } from '../../internal/patching/operator/distinctUntilKeyChanged';

Observable.prototype.distinctUntilKeyChanged = distinctUntilKeyChanged;

declare module '../../internal/Observable' {
  interface Observable<T> {
    distinctUntilKeyChanged: typeof distinctUntilKeyChanged;
  }
}
