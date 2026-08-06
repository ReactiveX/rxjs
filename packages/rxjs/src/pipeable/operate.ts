import { create } from '../create.js';
import type { OperatorFunction } from './types.js';

/**
 * Creates a pipeable operator on the receiver's RxJS construction protocol.
 *
 * The operator setup callback runs when the result Observable activates. Any
 * synchronous error thrown while connecting the source is delivered through
 * `subscriber.error`. Notification callbacks should subscribe through
 * `subscribeToSource`, which provides the corresponding asynchronous callback
 * safety and signal ownership.
 *
 * @internal
 */
export function operate<T, R>(init: (source: Observable<T>, subscriber: Subscriber<R>) => void): OperatorFunction<T, R> {
  return (source) =>
    source[create]((subscriber) => {
      try {
        init(source, subscriber);
      } catch (error) {
        subscriber.error(error);
      }
    });
}
