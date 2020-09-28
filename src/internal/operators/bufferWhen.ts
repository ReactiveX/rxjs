/** @prettier */
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { ObservableInput, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/from';

/**
 * Buffers the source Observable values, using a factory function of closing
 * Observables to determine when to close, emit, and reset the buffer.
 *
 * <span class="informal">Collects values from the past as an array. When it
 * starts collecting values, it calls a function that returns an Observable that
 * tells when to close the buffer and restart collecting.</span>
 *
 * ![](bufferWhen.png)
 *
 * Opens a buffer immediately, then closes the buffer when the observable
 * returned by calling `closingSelector` function emits a value. When it closes
 * the buffer, it immediately opens a new buffer and repeats the process.
 *
 * ## Example
 *
 * Emit an array of the last clicks every [1-5] random seconds
 *
 * ```ts
 * import { fromEvent, interval } from 'rxjs';
 * import { bufferWhen } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferWhen(() =>
 *   interval(1000 + Math.random() * 4000)
 * ));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link windowWhen}
 *
 * @param {function(): Observable} closingSelector A function that takes no
 * arguments and returns an Observable that signals buffer closure.
 * @return {Observable<T[]>} An observable of arrays of buffered values.
 * @name bufferWhen
 */
export function bufferWhen<T>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, T[]> {
  return operate((source, subscriber) => {
    let buffer: T[] | null = null;
    let closingSubscriber: Subscriber<T> | null = null;

    const openBuffer = () => {
      closingSubscriber?.unsubscribe();

      const b = buffer;
      buffer = [];
      b && subscriber.next(b);

      let closingNotifier: Observable<any>;
      try {
        closingNotifier = innerFrom(closingSelector());
      } catch (err) {
        subscriber.error(err);
        return;
      }

      closingNotifier.subscribe((closingSubscriber = new OperatorSubscriber(subscriber, openBuffer, undefined, () => openBuffer())));
    };

    openBuffer();

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => buffer?.push(value),
        undefined,
        () => {
          buffer && subscriber.next(buffer);
          subscriber.complete();
        },
        () => (buffer = closingSubscriber = null!)
      )
    );
  });
}
