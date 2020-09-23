/** @prettier */
import { Subject } from './Subject';
import { TimestampProvider } from './types';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { dateTimestampProvider } from './scheduler/dateTimestampProvider';

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
  private buffer: (T | number)[] = [];
  private infiniteTimeWindow = true;

  /**
   * @param bufferSize The size of the buffer to replay on subscription
   * @param windowTime The amount of time the buffered items will say buffered
   * @param timestampProvider An object with a `now()` method that provides the current timestamp. This is used to
   * calculate the amount of time something has been buffered.
   */
  constructor(
    private bufferSize = Infinity,
    private windowTime = Infinity,
    private timestampProvider: TimestampProvider = dateTimestampProvider
  ) {
    super();
    this.infiniteTimeWindow = windowTime === Infinity;
    this.bufferSize = Math.max(1, bufferSize);
    this.windowTime = Math.max(1, windowTime);
  }

  next(value: T): void {
    const { isStopped, buffer, infiniteTimeWindow, timestampProvider, windowTime } = this;
    if (!isStopped) {
      buffer.push(value);
      !infiniteTimeWindow && buffer.push(timestampProvider.now() + windowTime);
    }
    this.trimBuffer();
    super.next(value);
  }

  /** @deprecated Remove in v8. This is an internal implementation detail, do not use. */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    this._throwIfClosed();
    this.trimBuffer();

    const subscription = this._innerSubscribe(subscriber);

    const { infiniteTimeWindow, buffer } = this;
    // We use a copy here, so reentrant code does not mutate our array while we're
    // emitting it to a new subscriber.
    const copy = buffer.slice();
    for (let i = 0; i < copy.length && !subscriber.closed; i += infiniteTimeWindow ? 1 : 2) {
      subscriber.next(copy[i] as T);
    }

    this._checkFinalizedStatuses(subscriber);

    return subscription;
  }

  private trimBuffer() {
    const { bufferSize, timestampProvider, buffer, infiniteTimeWindow } = this;
    // If we don't have an infinite buffer size, and we're over the length,
    // use splice to truncate the old buffer values off. Note that we have to
    // double the size for instances where we're not using an infinite time window
    // because we're storing the values and the timestamps in the same array.
    const adjustedBufferSize = (infiniteTimeWindow ? 1 : 2) * bufferSize;
    bufferSize < Infinity && adjustedBufferSize < buffer.length && buffer.splice(0, buffer.length - adjustedBufferSize);

    // Now, if we're not in an infinite time window, remove all values where the time is
    // older than what is allowed.
    if (!infiniteTimeWindow) {
      const now = timestampProvider.now();
      let last = 0;
      // Search the array for the first timestamp that isn't expired and
      // truncate the buffer up to that point.
      for (let i = 1; i < buffer.length && (buffer[i] as number) <= now; i += 2) {
        last = i;
      }
      last && buffer.splice(0, last + 1);
    }
  }
}
