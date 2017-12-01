
import { Observable } from '../../Observable';
import { distinctUntilKeyChanged } from '../../internal/patching/operator/distinctUntilKeyChanged';

Observable.prototype.distinctUntilKeyChanged = distinctUntilKeyChanged;

declare module '../../Observable' {
  interface Observable<T> {
    distinctUntilKeyChanged: typeof distinctUntilKeyChanged;
  }
}
