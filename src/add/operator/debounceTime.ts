
import {Observable} from '../../Observable';
import {debounceTime} from '../../operator/debounceTime';
import {Scheduler} from '../../Scheduler';

Observable.prototype.debounceTime = debounceTime;

declare module '../../Observable' {
  interface Observable<T> {
    debounceTime: <R>(dueTime: number, scheduler?: Scheduler) => Observable<R>;
  }
}

export var _void: void;