import { IScheduler } from '../Scheduler';
import { Action } from '../scheduler/Action';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';

interface PairsContext<T> {
  obj: Object;
  keys: Array<string>;
  length: number;
  index: number;
  subscriber: Subscriber<Array<string | T>>;
}

function dispatch<T>(this: Action<PairsContext<T>>, state: PairsContext<T>) {
  const {obj, keys, length, index, subscriber} = state;

  if (index === length) {
    subscriber.complete();
    return;
  }

  const key = keys[index];
  subscriber.next([key, obj[key]]);

  state.index = index + 1;

  this.schedule(state);
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class PairsObservable<T> extends Observable<Array<string | T>> {
  private keys: Array<string>;

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
 * pass a {@link Scheduler} as a second argument to `pairs`.
 *
 * @example <caption>Converts a javascript object to an Observable</caption>
 * var obj = {
 *   foo: 42,
 *   bar: 56,
 *   baz: 78
 * };
 *
 * Rx.Observable.pairs(obj)
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('the end!')
 * );
 *
 * // Logs:
 * // ["foo": 42],
 * // ["bar": 56],
 * // ["baz": 78],
 * // "the end!"
 *
 *
 * @param {Object} obj The object to inspect and turn into an
 * Observable sequence.
 * @param {Scheduler} [scheduler] An optional IScheduler to schedule
 * when resulting Observable will emit values.
 * @returns {(Observable<Array<string|T>>)} An observable sequence of
 * [key, value] pairs from the object.
 * @static true
 * @name pairs
 * @owner Observable
 */
  static create<T>(obj: Object, scheduler?: IScheduler): Observable<Array<string | T>> {
    return new PairsObservable<T>(obj, scheduler);
  }

  constructor(private obj: Object, private scheduler?: IScheduler) {
    super();
    this.keys = Object.keys(obj);
  }

  protected _subscribe(subscriber: Subscriber<Array<string | T>>): TeardownLogic {
    const {keys, scheduler} = this;
    const length = keys.length;

    if (scheduler) {
      return scheduler.schedule(dispatch, 0, {
        obj: this.obj, keys, length, index: 0, subscriber
      });
    } else {
      for (let idx = 0; idx < length; idx++) {
        const key = keys[idx];
        subscriber.next([key, this.obj[key]]);
      }
      subscriber.complete();
    }
  }
}
