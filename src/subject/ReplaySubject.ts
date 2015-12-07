import {Subject} from '../Subject';
import {Scheduler} from '../Scheduler';
import {queue} from '../scheduler/queue';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

export class ReplaySubject<T> extends Subject<T> {
  private bufferSize: number;
  private _windowTime: number;
  private scheduler: Scheduler;
  private events: ReplayEvent<T>[] = [];

  constructor(bufferSize: number = Number.POSITIVE_INFINITY,
              windowTime: number = Number.POSITIVE_INFINITY,
              scheduler?: Scheduler) {
    super();
    this.bufferSize = bufferSize < 1 ? 1 : bufferSize;
    this._windowTime = windowTime < 1 ? 1 : windowTime;
    this.scheduler = scheduler;
  }

  _next(value: T): void {
    const now = this._getNow();
    this.events.push(new ReplayEvent(now, value));
    this._trimBufferThenGetEvents(now);
    super._next(value);
  }

  _subscribe(subscriber: Subscriber<any>): Subscription<T> {
    const events = this._trimBufferThenGetEvents(this._getNow());
    let index = -1;
    const len = events.length;
    while (!subscriber.isUnsubscribed && ++index < len) {
      subscriber.next(events[index].value);
    }
    return super._subscribe(subscriber);
  }

  private _getNow(): number {
    return (this.scheduler || queue).now();
  }

  private _trimBufferThenGetEvents(now): ReplayEvent<T>[] {
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
  constructor(public time: number, public value: T) {
  }
}

