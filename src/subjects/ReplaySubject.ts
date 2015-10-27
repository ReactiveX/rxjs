import Subject from '../Subject';
import Scheduler from '../Scheduler';
import immediate from '../schedulers/immediate';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';

export default class ReplaySubject<T> extends Subject<T> {
  private bufferSize: number;
  private _windowTime: number;
  private scheduler: Scheduler;
  private events: ReplayEvent<T> [] = [];

  constructor(bufferSize: number = Number.POSITIVE_INFINITY,
              _windowTime: number = Number.POSITIVE_INFINITY,
              scheduler?: Scheduler) {
    super();
    this.bufferSize = bufferSize < 1 ? 1 : bufferSize;
    this._windowTime = _windowTime < 1 ? 1 : _windowTime;
    this.scheduler = scheduler;
  }

  _next(value?) {
    const now = this._getNow();
    this.events.push(new ReplayEvent(now, value));
    super._next(value);
  }

  _subscribe(subscriber: Subscriber<any>): Subscription<T> {
    const events = this._getEvents(this._getNow());
    let index = -1;
    const len = events.length;
    while (!subscriber.isUnsubscribed && ++index < len) {
      subscriber.next(events[index].value);
    }
    return super._subscribe(subscriber);
  }

  private _getNow() {
    return (this.scheduler || immediate).now();
  }

  private _getEvents(now) {

    const bufferSize = this.bufferSize;
    const _windowTime = this._windowTime;
    const events = this.events;

    let eventsCount = events.length;
    let spliceCount = 0;

    // Trim events that fall out of the time window.
    // Start at the front of the list. Break early once
    // we encounter an event that falls within the window.
    while (spliceCount < eventsCount) {
      if ((now - events[spliceCount].time) < _windowTime) {
        break;
      }
      spliceCount += 1;
    }

    if (eventsCount > bufferSize) {
      spliceCount = Math.max(spliceCount, eventsCount - bufferSize);
    }

    if (spliceCount > 0) {
      events.splice(0, spliceCount);
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

