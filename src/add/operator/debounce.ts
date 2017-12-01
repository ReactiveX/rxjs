
import { Observable } from '../../Observable';
import { debounce } from '../../internal/patching/operator/debounce';

Observable.prototype.debounce = debounce;

declare module '../../Observable' {
  interface Observable<T> {
    debounce: typeof debounce;
  }
}
