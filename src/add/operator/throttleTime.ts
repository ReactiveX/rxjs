
import {Observable} from '../../Observable';
import {Scheduler} from '../../Scheduler';
import {throttleTime} from '../../operator/throttleTime';

Observable.prototype.throttleTime = throttleTime;

declare module '../../Observable' {
  interface Observable<T> {
    throttleTime: (delay: number, scheduler?: Scheduler) => Observable<T>;
  }
}

export var _void: void;