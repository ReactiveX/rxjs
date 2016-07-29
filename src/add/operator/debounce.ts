
import {Observable} from '../../Observable';
import {debounce, DebounceSignature} from '../../operator/debounce';

Observable.prototype.debounce = debounce;

declare module '../../Observable' {
  interface IObservable<T> {
    debounce: DebounceSignature<T>;
  }
}