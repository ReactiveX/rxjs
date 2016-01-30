
import {Observable} from '../../Observable';
import {bufferTime} from '../../operator/bufferTime';
import {Scheduler} from '../../Scheduler';

Observable.prototype.bufferTime = bufferTime;

declare module '../../Observable' {
  interface Observable<T> {
    bufferTime: (bufferTimeSpan: number, bufferCreationInterval?: number, scheduler?: Scheduler) => Observable<T[]>;
  }
}

export var _void: void;