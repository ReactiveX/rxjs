
import {Observable} from '../../Observable';
import {Scheduler} from '../../Scheduler';
import {observeOn} from '../../operator/observeOn';

Observable.prototype.observeOn = observeOn;

declare module '../../Observable' {
  interface Observable<T> {
    observeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;
  }
}

export var _void: void;