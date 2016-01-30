
import {Observable} from '../../Observable';
import {_do} from '../../operator/do';

Observable.prototype.do = _do;

declare module '../../Observable' {
  interface Observable<T> {
    do: (next?: (x: T) => void, error?: (e: any) => void, complete?: () => void) => Observable<T>;
  }
}

export var _void: void;