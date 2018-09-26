import { Observable } from '../Observable';
import { Operation, Sink, FOType, SinkArg } from '../types';
import { pipe } from '../util/pipe';
import { lift } from 'rxjs/internal/util/lift';
import { Subscription } from '../Subscription';

/**
 * Buffers the source Observable values until `closingNotifier` emits.
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * that array only when another Observable emits.</span>
 *
 * ![](buffer.png)
 *
 * Buffers the incoming Observable values until the given `closingNotifier`
 * Observable emits a value, at which point it emits the buffer on the output
 * Observable and starts a new buffer internally, awaiting the next time
 * `closingNotifier` emits.
 *
 * ## Example
 *
 * On every click, emit array of most recent interval events
 *
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const interval = interval(1000);
 * const buffered = interval.pipe(buffer(clicks));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link window}
 *
 * @param {Observable<any>} closingNotifier An Observable that signals the
 * buffer to be emitted on the output Observable.
 * @return {Observable<T[]>} An Observable of buffers, which are arrays of
 * values.
 * @method buffer
 * @owner Observable
 */
export function buffer<T>(closingNotifier: Observable<any>): Operation<T, T[]> {
  return lift((source: Observable<T>, dest: Sink<T[]>, subs: Subscription) => {
    const closingSubs = new Subscription();
    let buffer: T[] = [];

    subs.add(closingSubs);
    closingNotifier(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<any>, closingSubs: Subscription) => {
      if (t === FOType.NEXT) {
        const copy = buffer.slice();
        buffer = [];
        dest(FOType.NEXT, copy, subs);
      } else {
        dest(t, v, subs);
        subs.unsubscribe();
      }
    }, closingSubs);

    if (!subs.closed) {
      source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
        if (t === FOType.NEXT) {
          buffer.push(v);
        } else {
          dest(t, v, subs);
          subs.unsubscribe();
        }
      }, subs);
    }
  });
}
