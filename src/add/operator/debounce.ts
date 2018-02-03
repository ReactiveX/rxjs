
import { Observable } from '../../internal/Observable';
import { debounce } from '../../internal/patching/operator/debounce';

Observable.prototype.debounce = debounce;

declare module '../../internal/Observable' {
  interface Observable<T> {
    debounce: typeof debounce;
  }
}
