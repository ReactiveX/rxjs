
import { Observable } from '../../internal/Observable';
import { startWith } from '../../internal/patching/operator/startWith';

Observable.prototype.startWith = startWith;

declare module '../../internal/Observable' {
  interface Observable<T> {
    startWith: typeof startWith;
  }
}
