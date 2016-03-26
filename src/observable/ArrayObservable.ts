import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {ScalarObservable} from './ScalarObservable';
import {EmptyObservable} from './EmptyObservable';
import {Subscriber} from '../Subscriber';
import {isScheduler} from '../util/isScheduler';
import {TeardownLogic} from '../Subscription';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ArrayObservable<T> extends Observable<T> {

  static create<T>(array: T[], scheduler?: Scheduler): Observable<T> {
    return new ArrayObservable(array, scheduler);
  }

  /**
   * @param array
   * @return {any}
   * @static true
   * @name of
   * @owner Observable
   */
  static of<T>(...array: Array<T | Scheduler>): Observable<T> {
    let scheduler = <Scheduler>array[array.length - 1];
    if (isScheduler(scheduler)) {
      array.pop();
    } else {
      scheduler = null;
    }

    const len = array.length;
    if (len > 1) {
      return new ArrayObservable<T>(<any>array, scheduler);
    } else if (len === 1) {
      return new ScalarObservable<T>(<any>array[0], scheduler);
    } else {
      return new EmptyObservable<T>(scheduler);
    }
  }

  static dispatch(state: any) {

    const { array, index, count, subscriber } = state;

    if (index >= count) {
      subscriber.complete();
      return;
    }

    subscriber.next(array[index]);

    if (subscriber.isUnsubscribed) {
      return;
    }

    state.index = index + 1;

    (<any> this).schedule(state);
  }

  // value used if Array has one value and _isScalar
  value: any;

  constructor(public array: T[], public scheduler?: Scheduler) {
    super();
    if (!scheduler && array.length === 1) {
      this._isScalar = true;
      this.value = array[0];
    }
  }

  protected _subscribe(subscriber: Subscriber<T>): TeardownLogic {
    let index = 0;
    const array = this.array;
    const count = array.length;
    const scheduler = this.scheduler;

    if (scheduler) {
      return scheduler.schedule(ArrayObservable.dispatch, 0, {
        array, index, count, subscriber
      });
    } else {
      for (let i = 0; i < count && !subscriber.isUnsubscribed; i++) {
        subscriber.next(array[i]);
      }
      subscriber.complete();
    }
  }
}
