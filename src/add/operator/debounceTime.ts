
import {Observable} from '../../Observable';
import {debounceTime, DebounceTimeSignature} from '../../operator/debounceTime';

Observable.prototype.debounceTime = debounceTime;

declare module '../../Observable' {
  interface Observable<T> {
    debounceTime: DebounceTimeSignature<T>;
  }
}