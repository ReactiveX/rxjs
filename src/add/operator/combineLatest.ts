
import { Observable } from '../../Observable';
import { combineLatest, CombineLatestSignature } from '../../operator/combineLatest';

Observable.prototype.combineLatest = combineLatest;

declare module '../../Observable' {
  interface Observable<T> {
    combineLatest: CombineLatestSignature<T>;
  }
}