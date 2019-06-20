import { Subject } from './Subject';
import { SchedulerLike } from './types';
import { queue } from './scheduler/queue';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { ObserveOnSubscriber } from './operators/observeOn';
import { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';
import { SubjectSubscription } from './SubjectSubscription';

interface ReplayEvent<T> {
  time: number;
  value: T;
}

/**
 * A variant of Subject that "replays" or emits old values to new subscribers.
 * It buffers a set number of values and will emit those values immediately to
 * any new subscribers in addition to emitting new values to existing subscribers.
 *
 * @class ReplaySubject<T>
 */
export class ReplaySubject<T> extends Subject<T> {
  private _events: (ReplayEvent<T> | T)[] = [];
  private _bufferSize: number;
  private _windowTime: number;
  private _infiniteTimeWindow: boolean = false;

  constructor(bufferSize: number = Number.POSITIVE_INFINITY,
              windowTime: number = Number.POSITIVE_INFINITY,
              private scheduler?: SchedulerLike) {
    super();
    this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
    this._windowTime = windowTime < 1 ? 1 : windowTime;

    if (windowTime === Number.POSITIVE_INFINITY) {
      this._infiniteTimeWindow = true;
      this.next = this.nextInfiniteTimeWindow;
    } else {
      this.next = this.nextTimeWindow;
    }
  }

  private nextInfiniteTimeWindow(value: T): void {
    this._events.push(value);
    // Since this method is invoked in every next() call than the buffer
    // can overgrow the max size only by one item
    if (this._events.length > this._bufferSize) {
      this._events.shift();
    }

    super.next(value);
  }

  private nextTimeWindow(value: T): void {
    this._events.push({time: this._getNow(), value});
    this._trimBufferThenGetEvents();

    super.next(value);
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>): Subscription {
    // When `_infiniteTimeWindow === true` then the buffer is already trimmed
    const _events = this._infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
    let subscription: Subscription;

    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else if (this.isStopped || this.hasError) {
      subscription = Subscription.EMPTY;
    } else {
      this.observers.push(subscriber);
      subscription = new SubjectSubscription(this, subscriber);
    }

    if (this.scheduler) {
      subscriber.add(subscriber = new ObserveOnSubscriber<T>(subscriber, this.scheduler));
    }

    if (this._infiniteTimeWindow) {
      _events.forEach(event => {
        if (!subscriber.closed) {
          subscriber.next(<T>event);
        }
      });
    } else {
      _events.forEach(event => {
        if (!subscriber.closed) {
          subscriber.next((<ReplayEvent<T>>event).value);
        }
      });
    }

    if (this.hasError) {
      subscriber.error(this.thrownError);
    } else if (this.isStopped) {
      subscriber.complete();
    }

    return subscription;
  }

  _getNow(): number {
    return (this.scheduler || queue).now();
  }

  private _trimBufferThenGetEvents(): (ReplayEvent<T> | T)[] {
    let spliceCount = 0;
    const now = this._getNow();

    // Trim events that fall out of the time window.
    // Start at the front of the list. Break early once
    // we encounter an event that falls within the window.
    this._events.some((event, index) => {
      if ((now - (<ReplayEvent<T>>event).time) < this._windowTime) {
        spliceCount = index;
        return true;
      }
      return false;
    });

    if (this._events.length > this._bufferSize) {
      spliceCount = Math.max(spliceCount, this._events.length - this._bufferSize);
    }

    if (spliceCount > 0) {
      this._events.splice(0, spliceCount);
    }

    return this._events;
  }

}
