import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {ScalarObservable} from './ScalarObservable';
import {EmptyObservable} from './EmptyObservable';
import {Subscriber} from '../Subscriber';
import {TeardownLogic} from '../Subscription';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ArrayLikeObservable<T> extends Observable<T> {

  private mapFn: (x: T, y: number) => T;

  static create<T>(arrayLike: ArrayLike<T>, mapFn: (x: T, y: number) => T, thisArg: any, scheduler?: Scheduler): Observable<T> {
    const length = arrayLike.length;
    if (length === 0) {
      return new EmptyObservable<T>();
    } else if (length === 1 && !mapFn) {
      return new ScalarObservable<T>(<any>arrayLike[0], scheduler);
    } else {
      return new ArrayLikeObservable(arrayLike, mapFn, thisArg, scheduler);
    }
  }

  static dispatch(state: any) {
    const { arrayLike, index, length, mapFn, subscriber } = state;

    if (subscriber.isUnsubscribed) {
      return;
    }

    if (index >= length) {
      subscriber.complete();
      return;
    }

    const result = mapFn ? mapFn(arrayLike[index], index) : arrayLike[index];
    subscriber.next(result);

    state.index = index + 1;

    (<any> this).schedule(state);
  }

  // value used if Array has one value and _isScalar
  private value: any;

  constructor(private arrayLike: ArrayLike<T>, mapFn: (x: T, y: number) => T, thisArg: any, private scheduler?: Scheduler) {
    super();
    if (!mapFn && !scheduler && arrayLike.length === 1) {
      this._isScalar = true;
      this.value = arrayLike[0];
    }
    if (mapFn) {
      this.mapFn = mapFn.bind(thisArg);
    }
  }

  protected _subscribe(subscriber: Subscriber<T>): TeardownLogic {
    let index = 0;
    const { arrayLike, mapFn, scheduler } = this;
    const length = arrayLike.length;

    if (scheduler) {
      return scheduler.schedule(ArrayLikeObservable.dispatch, 0, {
        arrayLike, index, length, mapFn, subscriber
      });
    } else {
      for (let i = 0; i < length && !subscriber.isUnsubscribed; i++) {
        const result = mapFn ? mapFn(arrayLike[i], i) : arrayLike[i];
        subscriber.next(result);
      }
      subscriber.complete();
    }
  }
}
