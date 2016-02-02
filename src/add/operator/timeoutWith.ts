
import {Observable} from '../../Observable';
import {Scheduler} from '../../Scheduler';
import {timeoutWith} from '../../operator/timeoutWith';

Observable.prototype.timeoutWith = timeoutWith;

declare module '../../Observable' {
  interface Observable<T> {
    timeoutWith: <R>(due: number | Date, withObservable: Observable<R>, scheduler?: Scheduler) => Observable<T> | Observable<R>;
  }
}

export var _void: void;