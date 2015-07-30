import Subject from '../Subject';
import {SubjectSubscription} from '../Subject';
import Observer from '../Observer';
import Scheduler from '../Scheduler';
import Subscription from '../Subscription';

export default class ReplaySubject<T> extends Subject<T> {

  size: number;
  window: number;
  scheduler: Scheduler;
  private events: ReplayEvent<T> [] = [];

  constructor(size: number = Number.POSITIVE_INFINITY,
              window: number = Number.POSITIVE_INFINITY,
              scheduler?: Scheduler) {
    super();
    this.size = size < 1 ? 1 : size;
    this.window = window < 1 ? 1 : window;
    this.scheduler = scheduler;
  }

  _next(value?) {
    const now = this._getNow();
    this.events.push(new ReplayEvent(now, value));
    this._getEvents(now);
    super._next(value);
  }

  _subscribe(subscriber) {
    const events = this._getEvents(this._getNow());
    let index = -1;
    const len = events.length;
    while(++index < len) {
      subscriber.next(events[index].value);
    }
    return super._subscribe(subscriber);
  }

  private _getNow() {
    return (this.scheduler || Scheduler.immediate).now();
  }

  private _getEvents(now) {
    const size = this.size;
    const window = this.window;
    const events = this.events;
    while(events.length > size) {
      events.shift();
    }
    while(events.length > 0 && (now - events[0].time) > window) {
      events.shift();
    }
    return events;
  }
}

class ReplayEvent<T> {

  time: number;
  value: T;

  constructor(time: number, value: T) {
    this.time = time;
    this.value = value;
  }
}

