
import {Observable} from '../../Observable';
import {throttle} from '../../operator/throttle';

Observable.prototype.throttle = throttle;

declare module '../../Observable' {
  interface Observable<T> {
    throttle: (durationSelector: (value: T) => Observable<any> | Promise<any>) => Observable<T>;
  }
}

export var _void: void;