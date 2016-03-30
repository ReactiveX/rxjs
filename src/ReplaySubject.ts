import {Subject} from './Subject';
import {Scheduler} from './Scheduler';
import {queue} from './scheduler/queue';
import {Subscriber} from './Subscriber';
import {TeardownLogic} from './Subscription';
import {ObserveOnSubscriber} from './operator/observeOn';

/**
 * @class ReplaySubject<T>
 */
export class ReplaySubject<T> extends Subject<T> {
  private events: ReplayEvent<T>[] = [];
  private scheduler: Scheduler;
  private bufferSize: number;
  private _windowTime: number;

  constructor(bufferSize: number = Number.POSITIVE_INFINITY,
              windowTime: number = Number.POSITIVE_INFINITY,
              scheduler?: Scheduler) {
    super();
    this.scheduler = scheduler;
    this.bufferSize = bufferSize < 1 ? 1 : bufferSize;
    this._windowTime = windowTime < 1 ? 1 : windowTime;
  }

  protected _next(value: T): void {
    const now = this._getNow();
    this.events.push(new ReplayEvent(now, value));
    this._trimBufferThenGetEvents(now);
    super._next(value);
  }

  protected _subscribe(subscriber: Subscriber<T>): TeardownLogic {
    const events = this._trimBufferThenGetEvents(this._getNow());
    const scheduler = this.scheduler;

    if (scheduler) {
      subscriber.add(subscriber = new ObserveOnSubscriber<T>(subscriber, scheduler));
    }

    let index = -1;
    const len = events.length;
    while (++index < len && !subscriber.isUnsubscribed) {
      subscriber.next(events[index].value);
    }
    return super._subscribe(subscriber);
  }

  private _getNow(): number {
    return (this.scheduler || queue).now();
  }

  private _trimBufferThenGetEvents(now: number): ReplayEvent<T>[] {
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
