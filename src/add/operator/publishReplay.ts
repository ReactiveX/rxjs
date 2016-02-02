
import {Observable} from '../../Observable';
import {Scheduler} from '../../Scheduler';
import {ConnectableObservable} from '../../observable/ConnectableObservable';
import {publishReplay} from '../../operator/publishReplay';

Observable.prototype.publishReplay = publishReplay;

declare module '../../Observable' {
  interface Observable<T> {
    publishReplay: (bufferSize?: number, windowTime?: number, scheduler?: Scheduler) => ConnectableObservable<T>;
  }
}