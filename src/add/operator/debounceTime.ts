
import { Observable } from '../../Observable';
import { debounceTime } from '../../internal/patching/operator/debounceTime';

Observable.prototype.debounceTime = debounceTime;

declare module '../../Observable' {
  interface Observable<T> {
    debounceTime: typeof debounceTime;
  }
}
