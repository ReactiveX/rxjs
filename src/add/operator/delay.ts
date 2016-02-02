
import {Observable} from '../../Observable';
import {delay} from '../../operator/delay';
import {Scheduler} from '../../Scheduler';

Observable.prototype.delay = delay;

declare module '../../Observable' {
  interface Observable<T> {
    delay: (delay: number, scheduler?: Scheduler) => Observable<T>;
  }
}