/** @prettier */
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { OperatorFunction, TeardownLogic } from '../types';
import { lift } from '../util/lift';

/**
 * Buffers the source Observable values until the size hits the maximum
 * `bufferSize` given.
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * that array only when its size reaches `bufferSize`.</span>
 *
 * ![](bufferCount.png)
 *
 * Buffers a number of values from the source Observable by `bufferSize` then
 * emits the buffer and clears it, and starts a new buffer each
 * `startBufferEvery` values. If `startBufferEvery` is not provided or is
 * `null`, then new buffers are started immediately at the start of the source
 * and when each buffer closes and is emitted.
 *
 * ## Examples
 *
 * Emit the last two click events as an array
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { bufferCount } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferCount(2));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * On every click, emit the last two click events as an array
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { bufferCount } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferCount(2, 1));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link buffer}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link pairwise}
 * @see {@link windowCount}
 *
 * @param {number} bufferSize The maximum size of the buffer emitted.
 * @param {number} [startBufferEvery] Interval at which to start a new buffer.
 * For example if `startBufferEvery` is `2`, then a new buffer will be started
 * on every other value from the source. A new buffer is started at the
 * beginning of the source by default.
 * @return {Observable<T[]>} An Observable of arrays of buffered values.
 * @name bufferCount
 */
export function bufferCount<T>(bufferSize: number, startBufferEvery: number | null = null): OperatorFunction<T, T[]> {
  return function bufferCountOperatorFunction(source: Observable<T>) {
    return lift(source, function (this: Subscriber<T[]>, source: Observable<T>) {
      const subscriber = this;
      // A list of all buffers currently tracked.
      let buffers: T[][] = [];
      // A counter, used when a `startBufferEvery` value is supplied.
      let count = 0;

      source.subscribe(
        new BufferCountSubscriber(
          subscriber,
          (value: T) => {
            // If we have a `startBufferEvery`, and it's time,
            // OR if we don't have a `startBufferEvery`, and there's not a buffer yet,
            // Add a buffer.
            if ((startBufferEvery && count++ % startBufferEvery === 0) || (!startBufferEvery && buffers.length === 0)) {
              buffers.push([]);
            }

            // Push the value onto each buffer we are currently tracking,
            // and figure out if any of the buffers have reached the `bufferSize`.
            let filled: T[][] | null = null;
            for (const buffer of buffers) {
              buffer.push(value);
              if (buffer.length === bufferSize) {
                filled = filled ?? [];
                filled.push(buffer);
              }
            }

            if (filled) {
              // If we found some buffers that are filled,
              // Remove them from the internal buffers list and emit them.
              // Make sure to remove them first, so we don't accidentally add to them
              // as we're emitting them.
              for (const buffer of filled) {
                const index = buffers.indexOf(buffer);
                if (0 <= index) {
                  buffers.splice(index, 1);
                }
                subscriber.next(buffer);
              }
            }
          },
          () => {
            // The source has completed, emit all of the buffers we have
            // collected, and clear them out of our buffers array.
            while (buffers.length > 0) {
              subscriber.next(buffers.shift()!);
            }
            buffers = null!;
            // Notify the consumer that we're complete.
            subscriber.complete();
          }
        )
      );
    });
  };
}

// TODO: This is probably similar to the subscriber from `bufferTime`. https://github.com/ReactiveX/rxjs/pull/5712
class BufferCountSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<any>, protected _next: (value: T) => void, protected onBeforeComplete: () => void) {
    super(destination);
  }

  _complete() {
    this.onBeforeComplete();
    super._complete();
  }
}
