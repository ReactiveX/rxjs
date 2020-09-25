/** @prettier */
import { MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Returns an Observable that skips the first `count` items emitted by the source Observable.
 *
 * ![](skip.png)
 *
 * @param {Number} count - The number of times, items emitted by source Observable should be skipped.
 * @return {Observable} An Observable that skips values emitted by the source Observable.
 * @name skip
 */
export function skip<T>(count: number): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let seen = 0;
    source.subscribe(new OperatorSubscriber(subscriber, (value) => (count === seen ? subscriber.next(value) : seen++)));
  });
}
