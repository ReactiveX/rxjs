import {isArray} from '../util/isArray';
import {isFunction} from '../util/isFunction';
import {isPromise} from '../util/isPromise';
import {isScheduler} from '../util/isScheduler';
import {PromiseObservable} from './PromiseObservable';
import {IteratorObservable} from'./IteratorObservable';
import {ArrayObservable} from './ArrayObservable';
import {ArrayLikeObservable} from './ArrayLikeObservable';

import {Scheduler} from '../Scheduler';
import {$$observable} from '../symbol/observable';
import {$$iterator} from '../symbol/iterator';
import {Observable, ObservableInput} from '../Observable';
import {Subscriber} from '../Subscriber';
import {ObserveOnSubscriber} from '../operator/observeOn';

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

  /**
   * @param ish
   * @param mapFnOrScheduler
   * @param thisArg
   * @param lastScheduler
   * @return {any}
   * @static true
   * @name from
   * @owner Observable
   */
  static create<T>(ish: ObservableInput<T>, scheduler?: Scheduler): Observable<T>;
  static create<T, R>(ish: ArrayLike<T>, mapFn: (x: any, y: number) => R, thisArg?: any, scheduler?: Scheduler): Observable<R>;
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
