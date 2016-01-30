
import {Observable} from '../../Observable';
import {Scheduler} from '../../Scheduler';
import {subscribeOn} from '../../operator/subscribeOn';

Observable.prototype.subscribeOn = subscribeOn;

declare module '../../Observable' {
  interface Observable<T> {
    subscribeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;
  }
}

export var _void: void;