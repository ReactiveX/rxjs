
import {Observable} from '../../Observable';
import {Scheduler} from '../../Scheduler';
import {windowTime} from '../../operator/windowTime';

Observable.prototype.windowTime = windowTime;

declare module '../../Observable' {
  interface Observable<T> {
    windowTime: (windowTimeSpan: number, windowCreationInterval?: number, scheduler?: Scheduler) => Observable<Observable<T>>;
  }
}

export var _void: void;