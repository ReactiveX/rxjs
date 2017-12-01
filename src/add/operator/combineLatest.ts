
import { Observable } from '../../internal/Observable';
import { combineLatest } from '../../internal/patching/operator/combineLatest';

Observable.prototype.combineLatest = combineLatest;

declare module '../../internal/Observable' {
  interface Observable<T> {
    combineLatest: typeof combineLatest;
  }
}
