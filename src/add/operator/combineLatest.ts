
import { Observable } from '../../Observable';
import { combineLatest } from '../../internal/patching/operator/combineLatest';

Observable.prototype.combineLatest = combineLatest;

declare module '../../Observable' {
  interface Observable<T> {
    combineLatest: typeof combineLatest;
  }
}
