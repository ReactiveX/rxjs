
import {Observable} from '../../Observable';
import {Scheduler} from '../../Scheduler';
import {timeout} from '../../operator/timeout';

Observable.prototype.timeout = timeout;

declare module '../../Observable' {
  interface Observable<T> {
    timeout: (due: number | Date, errorToSend?: any, scheduler?: Scheduler) => Observable<T>;
  }
}

export var _void: void;