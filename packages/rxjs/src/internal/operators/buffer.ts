import type { OperatorFunction, ObservableInput } from '../types.js';
import { Observable, operate, from } from '@rxjs/observable';
import { noop } from '../util/noop.js';

/**
 * Buffers the source Observable values until `closingNotifier` emits.
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * that array only when another Observable emits.</span>
 *
 * ![](buffer.png)
 *
 * Buffers the incoming Observable values until the given `closingNotifier`
 * `ObservableInput` (that internally gets converted to an Observable)
 * emits a value, at which point it emits the buffer on the output
 * Observable and starts a new buffer internally, awaiting the next time
 * `closingNotifier` emits.
 *
 * ## Example
 *
 * On every click, emit array of most recent interval events
 *
 * ```ts
 * import { fromEvent, interval, buffer } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const intervalEvents = interval(1000);
 * const buffered = intervalEvents.pipe(buffer(clicks));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link window}
 *
 * @param closingNotifier An `ObservableInput` that signals the
 * buffer to be emitted on the output Observable.
 * @return A function that returns an Observable of buffers, which are arrays
 * of values.
 */
export function buffer<T>(closingNotifier: ObservableInput<any>): OperatorFunction<T, T[]> {
  return (source) =>
    new Observable((destination) => {
      // The current buffered values.
      let currentBuffer: T[] = [];

      // Subscribe to the closing notifier first.
      from(closingNotifier).subscribe(
        operate({
          destination,
          next: () => {
            // Start a new buffer and emit the previous one.
            const b = currentBuffer;
            currentBuffer = [];
            destination.next(b);
          },
          complete: noop,
        })
      );

      // Subscribe to our source.
      source.subscribe(
        operate({
          destination,
          next: (value) => currentBuffer.push(value),
          complete: () => {
            destination.next(currentBuffer);
            destination.complete();
          },
        })
      );

      return () => {
        // Ensure buffered values are released on finalization.
        currentBuffer = null!;
      };
    });
}
