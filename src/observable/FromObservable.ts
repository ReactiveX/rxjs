import {isArray} from '../util/isArray';
import {isFunction} from '../util/isFunction';
import {isPromise} from '../util/isPromise';
import {isScheduler} from '../util/isScheduler';
import {PromiseObservable} from './PromiseObservable';
import {IteratorObservable} from'./IteratorObservable';
import {ArrayObservable} from './ArrayObservable';
import {ArrayLikeObservable} from './ArrayLikeObservable';

import {Scheduler} from '../Scheduler';
import {$$iterator} from '../symbol/iterator';
import {Observable, ObservableInput} from '../Observable';
import {Subscriber} from '../Subscriber';
import {ObserveOnSubscriber} from '../operator/observeOn';

import * as $$observable from 'symbol-observable';

const isArrayLike = (<T>(x: any): x is ArrayLike<T> => x && typeof x.length === 'number');

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class FromObservable<T> extends Observable<T> {
  constructor(private ish: ObservableInput<T>, private scheduler: Scheduler) {
    super(null);
  }

  static create<T>(ish: ObservableInput<T>, scheduler?: Scheduler): Observable<T>;
  static create<T, R>(ish: ArrayLike<T>, mapFn: (x: any, y: number) => R, thisArg?: any, scheduler?: Scheduler): Observable<R>;

  /**
   * Creates an Observable from an Array, an array-like object, a Promise, an
   * iterable object, or an Observable-like object.
   *
   * <span class="informal">Converts almost anything to an Observable.</span>
   *
   * <img src="./img/from.png" width="100%">
   *
   * Convert various other objects and data types into Observables. `from`
   * converts a Promise or an array-like or an
   * [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable)
   * object into an Observable that emits the items in that promise or array or
   * iterable. A String, in this context, is treated as an array of characters.
   * Observable-like objects (contains a function named with the ES2015 Symbol
   * for Observable) can also be converted through this operator.
   *
   * @example <caption>Converts an array to an Observable</caption>
   * var array = [10, 20, 30];
   * var result = Rx.Observable.from(array);
   * result.subscribe(x => console.log(x));
   *
   * @example <caption>Convert an infinite iterable (from a generator) to an Observable</caption>
   * function* generateDoubles(seed) {
   *   var i = seed;
   *   while (true) {
   *     yield i;
   *     i = 2 * i; // double it
   *   }
   * }
   *  
   * var iterator = generateDoubles(3);
   * var result = Rx.Observable.from(iterator).take(10);
   * result.subscribe(x => console.log(x));
   *
   * @see {@link create}
   * @see {@link fromEvent}
   * @see {@link fromEventPattern}
   * @see {@link fromPromise}
   *  
   * @param {ObservableInput<T>} ish A subscribable object, a Promise, an
   * Observable-like, an Array, an iterable or an array-like object to be
   * converted.
   * @param {function(x: any, i: number): T} [mapFn] A "map" function to call
   * when converting array-like objects, where `x` is a value from the
   * array-like and `i` is the index of that value in the sequence.
   * @param {any} [thisArg] The context object to use when calling the `mapFn`,
   * if provided.
   * @param {Scheduler} [scheduler] The scheduler on which to schedule the
   * emissions of values.
   * @return {Observable<T>} The Observable whose values are originally from the
   * input object that was converted.
   * @static true
   * @name from
   * @owner Observable
   */
  static create<T>(ish: ObservableInput<T>,
                   mapFnOrScheduler?: Scheduler | ((x: any, y: number) => T),
                   thisArg?: any,
                   lastScheduler?: Scheduler): Observable<T> {
    let scheduler: Scheduler = null;
    let mapFn: (x: any, i: number) => T = null;
    if (isFunction(mapFnOrScheduler)) {
      scheduler = lastScheduler || null;
      mapFn = <(x: any, i: number) => T> mapFnOrScheduler;
    } else if (isScheduler(scheduler)) {
      scheduler = <Scheduler> mapFnOrScheduler;
    }

    if (ish != null) {
      if (typeof ish[$$observable] === 'function') {
        if (ish instanceof Observable && !scheduler) {
          return ish;
        }
        return new FromObservable<T>(ish, scheduler);
      } else if (isArray(ish)) {
        return new ArrayObservable<T>(ish, scheduler);
      } else if (isPromise(ish)) {
        return new PromiseObservable<T>(ish, scheduler);
      } else if (typeof ish[$$iterator] === 'function' || typeof ish === 'string') {
        return new IteratorObservable<T>(<any>ish, null, null, scheduler);
      } else if (isArrayLike(ish)) {
        return new ArrayLikeObservable(ish, mapFn, thisArg, scheduler);
      }
    }

    throw new TypeError((ish !== null && typeof ish || ish) + ' is not observable');
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const ish = this.ish;
    const scheduler = this.scheduler;
    if (scheduler == null) {
      return ish[$$observable]().subscribe(subscriber);
    } else {
      return ish[$$observable]().subscribe(new ObserveOnSubscriber(subscriber, scheduler, 0));
    }
  }
}
