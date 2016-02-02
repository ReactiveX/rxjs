
import {Observable} from '../../Observable';
import {_finally} from '../../operator/finally';

Observable.prototype.finally = _finally;

declare module '../../Observable' {
  interface Observable<T> {
    finally: (finallySelector: () => void) => Observable<T>;
  }
}

export var _void: void;