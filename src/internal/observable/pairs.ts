import { Observable } from '../Observable';
import { SchedulerLike } from '../types';
import { Subscriber } from '../Subscriber';

/**
 * Convert an object into an Observable of `[key, value]` pairs.
 *
 * <span class="informal">Turn entries of an object into a stream.</span>
 *
 * <img src="./img/pairs.png" width="100%">
 *
 * `pairs` takes an arbitrary object and returns an Observable that emits arrays. Each
 * emitted array has exactly two elements - the first is a key from the object
 * and the second is a value corresponding to that key. Keys are extracted from
 * an object via `Object.keys` function, which means that they will be only
 * enumerable keys that are present on an object directly - not ones inherited
 * via prototype chain.
 *
 * By default these arrays are emitted synchronously. To change that you can
 * pass a {@link SchedulerLike} as a second argument to `pairs`.
 *
 * @example <caption>Converts a javascript object to an Observable</caption>
 * ```javascript
 * import { pairs } from 'rxjs';
 *
 * const obj = {
 *   foo: 42,
 *   bar: 56,
 *   baz: 78
 * };
 *
 * pairs(obj)
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('the end!')
 * );
 *
 * // Logs:
 * // ["foo", 42],
 * // ["bar", 56],
 * // ["baz", 78],
 * // "the end!"
 * ```
 *
 * @param {Object} obj The object to inspect and turn into an
 * Observable sequence.
 * @param {Scheduler} [scheduler] An optional IScheduler to schedule
 * when resulting Observable will emit values.
 * @returns {(Observable<Array<string|T>>)} An observable sequence of
 * [key, value] pairs from the object.
 */
export function pairs<T>(obj: Object, scheduler?: SchedulerLike): Observable<[string, T]> {
  if (!scheduler) {
    return new Observable<[string, T]>(subscriber => {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length && !subscriber.closed; i++) {
        const key = keys[i];
        if (obj.hasOwnProperty(key)) {
          subscriber.next([key, obj[key]]);
        }
      }
      subscriber.complete();
    });
  } else {
    return new Observable<[string, T]>(subscriber => {
      const keys = Object.keys(obj);
      const state = { keys, index: 0, subscriber, obj, scheduler } as ScheduledState<T>;
      return scheduler.schedule<ScheduledState<T>>(dispatch, 0, state);
    });
  }
}

function dispatch<T>(
  state: ScheduledState<T>
) {
  const { keys, index, subscriber, obj, scheduler } = state;
  if (!subscriber.closed) {
    if (index < keys.length) {
      const key = keys[index];
      subscriber.next([key, obj[key]]);
      state.index++;
      subscriber.add(scheduler.schedule<ScheduledState<T>>(dispatch, 0, state));
    } else {
      subscriber.complete();
    }
  }
}

interface ScheduledState<T> {
  keys: string[];
  index: number;
  subscriber: Subscriber<[string, T]>;
  obj: Object;
  scheduler: SchedulerLike;
}
