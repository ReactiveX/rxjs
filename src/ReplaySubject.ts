import {Subject} from './Subject';
import {Scheduler} from './Scheduler';
import {queue} from './scheduler/queue';
import {Subscriber} from './Subscriber';
import {Subscription} from './Subscription';
import {ObserveOnSubscriber} from './operator/observeOn';

/**
 * @class ReplaySubject<T>
 */
export class ReplaySubject<T> extends Subject<T> {
  private events: ReplayEvent<T>[] = [];
  private bufferSize: number;
  private _windowTime: number;

  constructor(bufferSize: number = Number.POSITIVE_INFINITY,
              windowTime: number = Number.POSITIVE_INFINITY,
              private scheduler: Scheduler = queue) {
    super();
    this.bufferSize = bufferSize < 1 ? 1 : bufferSize;
    this._windowTime = windowTime < 1 ? 1 : windowTime;
  }

  next(value: T): void {
    const now = this.scheduler.now();
    this.events.push(new ReplayEvent(now, value));
    this._trimBufferThenGetEvents();
    super.next(value);
  }

  _subscribe(subscriber: Subscriber<T>): Subscription {
    const events = this._trimBufferThenGetEvents();
    const scheduler = this.scheduler;

    if (scheduler) {
      subscriber.add(subscriber = new ObserveOnSubscriber<T>(subscriber, scheduler));
    }

    const len = events.length;
    for (let i = 0; i < len && !subscriber.isUnsubscribed; i++) {
      subscriber.next(events[i].value);
    }

    return super._subscribe(subscriber);
  }

  private _trimBufferThenGetEvents(): ReplayEvent<T>[] {
    const now = this.scheduler.now();
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
      spliceCount++;
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
