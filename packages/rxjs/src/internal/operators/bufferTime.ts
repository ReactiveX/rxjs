import { Subscription, Observable, operate } from '@rxjs/observable';
import type { OperatorFunction, SchedulerLike } from '../types.js';
import { arrRemove } from '../util/arrRemove.js';
import { asyncScheduler } from '../scheduler/async.js';
import { popScheduler } from '../util/args.js';
import { executeSchedule } from '../util/executeSchedule.js';

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
 * import { fromEvent, bufferTime } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferTime(1000));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * Every 5 seconds, emit the click events from the next 2 seconds
 *
 * ```ts
 * import { fromEvent, bufferTime } from 'rxjs';
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
 * @param bufferTimeSpan The amount of time to fill each buffer array.
 * @param otherArgs Other configuration arguments such as:
 * - `bufferCreationInterval` - the interval at which to start new buffers;
 * - `maxBufferSize` - the maximum buffer size;
 * - `scheduler` - the scheduler on which to schedule the intervals that determine buffer boundaries.
 * @return A function that returns an Observable of arrays of buffered values.
 */
export function bufferTime<T>(bufferTimeSpan: number, ...otherArgs: any[]): OperatorFunction<T, T[]> {
  const scheduler = popScheduler(otherArgs) ?? asyncScheduler;
  const bufferCreationInterval = (otherArgs[0] as number) ?? null;
  const maxBufferSize = (otherArgs[1] as number) || Infinity;

  return (source) =>
    new Observable((destination) => {
      // The active buffers, their related subscriptions, and removal functions.
      let bufferRecords: { buffer: T[]; subs: Subscription }[] | null = [];
      // If true, it means that every time we emit a buffer, we want to start a new buffer
      // this is only really used for when *just* the buffer time span is passed.
      let restartOnEmit = false;

      destination.add(() => {
        bufferRecords = null;
      });

      /**
       * Does the work of emitting the buffer from the record, ensuring that the
       * record is removed before the emission so reentrant code (from some custom scheduling, perhaps)
       * does not alter the buffer. Also checks to see if a new buffer needs to be started
       * after the emit.
       */
      const emit = (record: { buffer: T[]; subs: Subscription }) => {
        const { buffer, subs } = record;
        subs.unsubscribe();
        arrRemove(bufferRecords, record);
        destination.next(buffer);
        restartOnEmit && startBuffer();
      };

      /**
       * Called every time we start a new buffer. This does
       * the work of scheduling a job at the requested bufferTimeSpan
       * that will emit the buffer (if it's not unsubscribed before then).
       */
      const startBuffer = () => {
        if (bufferRecords) {
          const subs = new Subscription();
          destination.add(subs);
          const buffer: T[] = [];
          const record = {
            buffer,
            subs,
          };
          bufferRecords.push(record);
          executeSchedule(subs, scheduler, () => emit(record), bufferTimeSpan);
        }
      };

      if (bufferCreationInterval !== null && bufferCreationInterval >= 0) {
        // The user passed both a bufferTimeSpan (required), and a creation interval
        // That means we need to start new buffers on the interval, and those buffers need
        // to wait the required time span before emitting.
        executeSchedule(destination, scheduler, startBuffer, bufferCreationInterval, true);
      } else {
        restartOnEmit = true;
      }

      startBuffer();

      source.subscribe(
        operate({
          destination,
          next: (value: T) => {
            // Copy the records, so if we need to remove one we
            // don't mutate the array. It's hard, but not impossible to
            // set up a buffer time that could mutate the array and
            // cause issues here.
            const recordsCopy = bufferRecords!.slice();
            for (const record of recordsCopy) {
              // Loop over all buffers and
              const { buffer } = record;
              buffer.push(value);
              // If the buffer is over the max size, we need to emit it.
              maxBufferSize <= buffer.length && emit(record);
            }
          },
          complete: () => {
            // The source completed, emit all of the active
            // buffers we have before we complete.
            while (bufferRecords?.length) {
              destination.next(bufferRecords.shift()!.buffer);
            }
            destination.complete();
            destination.unsubscribe();
          },
        })
      );
    });
}
