/** @prettier */
import { Operator } from '../Operator';
import { async } from '../scheduler/async';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { isScheduler } from '../util/isScheduler';
import { OperatorFunction, SchedulerAction, SchedulerLike } from '../types';
import { lift } from '../util/lift';

/* tslint:disable:max-line-length */
export function bufferTime<T>(bufferTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
export function bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number | null | undefined,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>;
export function bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number | null | undefined,
  maxBufferSize: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>;
/* tslint:enable:max-line-length */

/**
 * Buffers the source Observable values for a specific time period.
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * those arrays periodically in time.</span>
 *
 * ![](bufferTime.png)
 *
 * Buffers values from the source for a specific time duration `bufferTimeSpan`.
 * Unless the optional argument `bufferCreationInterval` is given, it emits and
 * resets the buffer every `bufferTimeSpan` milliseconds. If
 * `bufferCreationInterval` is given, this operator opens the buffer every
 * `bufferCreationInterval` milliseconds and closes (emits and resets) the
 * buffer every `bufferTimeSpan` milliseconds. When the optional argument
 * `maxBufferSize` is specified, the buffer will be closed either after
 * `bufferTimeSpan` milliseconds or when it contains `maxBufferSize` elements.
 *
 * ## Examples
 *
 * Every second, emit an array of the recent click events
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { bufferTime } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferTime(1000));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * Every 5 seconds, emit the click events from the next 2 seconds
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { bufferTime } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferTime(2000, 5000));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link windowTime}
 *
 * @param {number} bufferTimeSpan The amount of time to fill each buffer array.
 * @param {number} [bufferCreationInterval] The interval at which to start new
 * buffers.
 * @param {number} [maxBufferSize] The maximum buffer size.
 * @param {SchedulerLike} [scheduler=async] The scheduler on which to schedule the
 * intervals that determine buffer boundaries.
 * @return {Observable<T[]>} An observable of arrays of buffered values.
 * @name bufferTime
 */
export function bufferTime<T>(bufferTimeSpan: number, ...otherArgs: any[]): OperatorFunction<T, T[]> {
  let scheduler: SchedulerLike = async;

  if (isScheduler(otherArgs[otherArgs.length - 1])) {
    scheduler = otherArgs.pop() as SchedulerLike;
  }

  const bufferCreationInterval = (otherArgs[0] as number) ?? null;
  const maxBufferSize = (otherArgs[1] as number) || Infinity;

  return function bufferTimeOperatorFunction(source: Observable<T>) {
    return lift(source, function (this: Subscriber<T[]>, source: Observable<T>) {
      const subscriber = this;
      // The active buffers, their related subscriptions, and removal functions.
      let bufferRecords: { buffer: T[]; subs: Subscription; remove: () => void }[] | null = [];
      // If true, it means that every time we emit a buffer, we want to start a new buffer
      // this is only really used for when *just* the buffer time span is passed.
      let restartOnEmit = false;

      /**
       * Does the work of emitting the buffer from the record, ensuring that the
       * record is removed before the emission so reentrant code (from some custom scheduling, perhaps)
       * does not alter the buffer. Also checks to see if a new buffer needs to be started
       * after the emit.
       */
      const emit = (record: { buffer: T[]; subs: Subscription; remove: () => void }) => {
        record.remove();
        subscriber.next(record.buffer);
        if (restartOnEmit) {
          startBuffer();
        }
      };

      /**
       * Called every time we start a new buffer. This does
       * the work of scheduling a job at the requested bufferTimeSpan
       * that will emit the buffer (if it's not unsubscribed before then).
       */
      const startBuffer = () => {
        if (bufferRecords) {
          const subs = new Subscription();
          subscriber.add(subs);
          const buffer: T[] = [];
          const record = {
            buffer,
            subs,
            remove() {
              this.subs.unsubscribe();
              if (bufferRecords) {
                const index = bufferRecords.indexOf(this);
                if (0 <= index) {
                  bufferRecords.splice(index, 1);
                }
              }
            },
          };
          bufferRecords.push(record);
          subs.add(
            scheduler.schedule(() => {
              emit(record);
            }, bufferTimeSpan)
          );
        }
      };

      if (bufferCreationInterval !== null && bufferCreationInterval >= 0) {
        // The user passed both a bufferTimeSpan (required), and a creation interval
        // That means we need to start new buffers on the interval, and those buffers need
        // to wait the required time span before emitting.
        subscriber.add(
          scheduler.schedule(function () {
            startBuffer();
            if (!this.closed) {
              subscriber.add(this.schedule(null, bufferCreationInterval));
            }
          }, bufferCreationInterval)
        );
        startBuffer();
      } else {
        restartOnEmit = true;
        startBuffer();
      }

      const bufferTimeSubscriber = new BufferTimeSubscriber(
        subscriber,
        (value) => {
          // Copy the records, so if we need to remove one we
          // don't mutate the array. It's hard, but not impossible to
          // set up a buffer time that could mutate the array and
          // cause issues here.
          const recordsCopy = bufferRecords!.slice();
          for (let i = 0; i < recordsCopy.length; i++) {
            // Loop over all buffers and
            const record = recordsCopy[i];
            const { buffer } = record;
            buffer.push(value);
            // If the buffer is over the max size, we need to emit it.
            if (maxBufferSize <= buffer.length) {
              emit(record);
            }
          }
        },
        () => {
          // The source completed, emit all of the active
          // buffers we have before we complete.
          for (const record of bufferRecords!) {
            record.remove();
            subscriber.next(record.buffer);
          }
          // Free up memory.
          bufferRecords = null;
          bufferTimeSubscriber?.unsubscribe();
        }
      );

      source.subscribe(bufferTimeSubscriber);
    });
  };
}

class BufferTimeSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T[]>, protected _next: (value: T) => void, protected onBeforeComplete: () => void) {
    super(destination);
  }

  _complete() {
    this.onBeforeComplete();
    super._complete();
  }
}
