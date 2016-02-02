
import {Observable} from '../../Observable';
import {Scheduler} from '../../Scheduler';
import {sampleTime} from '../../operator/sampleTime';

Observable.prototype.sampleTime = sampleTime;

declare module '../../Observable' {
  interface Observable<T> {
    sampleTime: (delay: number, scheduler?: Scheduler) => Observable<T>;
  }
}

export var _void: void;