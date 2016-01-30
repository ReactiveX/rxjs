
import {Observable} from '../../Observable';
import {debounce} from '../../operator/debounce';

Observable.prototype.debounce = debounce;

declare module '../../Observable' {
  interface Observable<T> {
    debounce: (durationSelector: (value: T) => Observable<any> | Promise<any>) => Observable<T>;
  }
}

export var _void: void;