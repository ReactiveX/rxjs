
import { Observable } from '../../Observable';
import { pluck } from '../../internal/patching/operator/pluck';

Observable.prototype.pluck = pluck;

declare module '../../Observable' {
  interface Observable<T> {
    pluck: typeof pluck;
  }
}
