
import { Observable } from '../../internal/Observable';
import { debounceTime } from '../../internal/patching/operator/debounceTime';

Observable.prototype.debounceTime = debounceTime;

declare module '../../internal/Observable' {
  interface Observable<T> {
    debounceTime: typeof debounceTime;
  }
}
