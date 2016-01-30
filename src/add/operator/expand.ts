
import {Observable} from '../../Observable';
import {expand} from '../../operator/expand';
import {Scheduler} from '../../Scheduler';

Observable.prototype.expand = expand;

declare module '../../Observable' {
  interface Observable<T> {
    expand: <R>(project: (x: T, ix: number) => Observable<R>, concurrent: number, scheduler: Scheduler) => Observable<R>;
  }
}

export var _void: void;