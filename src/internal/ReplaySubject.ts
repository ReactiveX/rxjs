import { Subject } from './Subject';
import { TimestampProvider } from './types';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';
import { SubjectSubscription } from './SubjectSubscription';

/**
 * A variant of {@link Subject} that "replays" old values to new subscribers by emitting them when they first subscribe.
 *
 * `ReplaySubject` has an internal buffer that will store a specified number of values that it has observed. Like `Subject`,
 * `ReplaySubject` "observes" values by having them passed to its `next` method. When it observes a value, it will store that
 * value for a time determined by the configuration of the `ReplaySubject`, as passed to its constructor.
 *
 * When a new subscriber subscribes to the `ReplaySubject` instance, it will synchronously emit all values in its buffer in
 * a First-In-First-Out (FIFO) manner. The `ReplaySubject` will also complete, if it has observed completion; and it will
 * error if it has observed an error.
 *
 * There are two main configuration items to be concerned with:
 *
 * 1. `bufferSize` - This will determine how many items are stored in the buffer, defaults to infinite.
 * 2. `windowTime` - The amount of time to hold a value in the buffer before removing it from the buffer.
 *
 * Both configurations may exist simultaneously. So if you would like to buffer a maximum of 3 values, as long as the values
 * are less than 2 seconds old, you could do so with a `new ReplaySubject(3, 2000)`.
 *
 * ### Differences with BehaviorSubject
 *
 * `BehaviorSubject` is similar to `new ReplaySubject(1)`, with a couple fo exceptions:
 *
 * 1. `BehaviorSubject` comes "primed" with a single value upon construction.
 * 2. `ReplaySubject` will replay values, even after observing an error, where `BehaviorSubject` will not.
 *
 * {@see Subject}
 * {@see BehaviorSubject}
 * {@see shareReplay}
 */
export class ReplaySubject<T> extends Subject<T> {
  private _events: (ReplayEvent<T> | T)[] = [];
  private _bufferSize: number;
  private _windowTime: number;
  private _infiniteTimeWindow: boolean = false;

  /**
   * @param bufferSize The size of the buffer to replay on subscription
   * @param windowTime The amount of time the buffered items will say buffered
   * @param timestampProvider An object with a `now()` method that provides the current timestamp. This is used to
   * calculate the amount of time something has been buffered.
   */
  constructor(bufferSize: number = Infinity,
              windowTime: number = Infinity,
              private timestampProvider: TimestampProvider = Date) {
    super();
    this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
    this._windowTime = windowTime < 1 ? 1 : windowTime;

    if (windowTime === Infinity) {
      this._infiniteTimeWindow = true;
      /** @override */
      this.next = this.nextInfiniteTimeWindow;
    } else {
      this.next = this.nextTimeWindow;
    }
  }

  private nextInfiniteTimeWindow(value: T): void {
    const _events = this._events;
    _events.push(value);
    // Since this method is invoked in every next() call than the buffer
    // can overgrow the max size only by one item
    if (_events.length > this._bufferSize) {
      _events.shift();
    }

    super.next(value);
  }

  private nextTimeWindow(value: T): void {
    this._events.push({ time: this._getNow(), value });
    this._trimBufferThenGetEvents();

    super.next(value);
  }

  /** @deprecated Remove in v8. This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>): Subscription {
    // When `_infiniteTimeWindow === true` then the buffer is already trimmed
    const _infiniteTimeWindow = this._infiniteTimeWindow;
    const _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
    const len = _events.length;
    let subscription: Subscription;

    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else if (this.isStopped || this.hasError) {
      subscription = Subscription.EMPTY;
    } else {
      this.observers.push(subscriber);
      subscription = new SubjectSubscription(this, subscriber);
    }

    if (_infiniteTimeWindow) {
      for (let i = 0; i < len && !subscriber.closed; i++) {
        subscriber.next(<T>_events[i]);
      }
    } else {
      for (let i = 0; i < len && !subscriber.closed; i++) {
        subscriber.next((<ReplayEvent<T>>_events[i]).value);
      }
    }

    if (this.hasError) {
      subscriber.error(this.thrownError);
    } else if (this.isStopped) {
      subscriber.complete();
    }

    return subscription;
  }

  private _getNow(): number {
    const { timestampProvider: scheduler } = this;
    return scheduler ? scheduler.now() : Date.now();
  }

  private _trimBufferThenGetEvents(): ReplayEvent<T>[] {
    const now = this._getNow();
    const _bufferSize = this._bufferSize;
    const _windowTime = this._windowTime;
    const _events = <ReplayEvent<T>[]>this._events;

    const eventsCount = _events.length;
    let spliceCount = 0;

    // Trim events that fall out of the time window.
    // Start at the front of the list. Break early once
    // we encounter an event that falls within the window.
    while (spliceCount < eventsCount) {
      if ((now - _events[spliceCount].time) < _windowTime) {
        break;
      }
      spliceCount++;
    }

    if (eventsCount > _bufferSize) {
      spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
    }

    if (spliceCount > 0) {
      _events.splice(0, spliceCount);
    }

    return _events;
  }

}

interface ReplayEvent<T> {
  time: number;
  value: T;
}
