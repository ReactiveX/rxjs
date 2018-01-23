
import { Observable } from '../../internal/Observable';
import { pluck } from '../../internal/patching/operator/pluck';

Observable.prototype.pluck = pluck;

declare module '../../internal/Observable' {
  interface Observable<T> {
    pluck: typeof pluck;
  }
}
