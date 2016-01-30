
import {Observable} from '../../Observable';
import {debounce, DebounceSignature} from '../../operator/debounce';

Observable.prototype.debounce = debounce;

declare module '../../Observable' {
  interface Observable<T> {
    debounce: DebounceSignature<T>;
  }
}