import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Returns the source Observable delayed by the computed debounce duration,
 * with the duration lengthened if a new source item arrives before the delay
 * duration ends.
 * In practice, for each item emitted on the source, this operator holds the
 * latest item, waits for a silence as long as the `durationSelector` specifies,
 * and only then emits the latest source item on the result Observable.
 * @param {function} durationSelector function for computing the timeout duration for each item.
 * @returns {Observable} an Observable the same as source Observable, but drops items.
 */
export function debounce<T>(durationSelector: (value: T) => Observable<number> | Promise<number>): Observable<T> {
  return this.lift(new DebounceOperator(durationSelector));
}

class DebounceOperator<T> implements Operator<T, T> {
  constructor(private durationSelector: (value: T) => Observable<number> | Promise<number>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DebounceSubscriber(subscriber, this.durationSelector);
  }
}

class DebounceSubscriber<T, R> extends OuterSubscriber<T, R> {
  private value: T;
  private hasValue: boolean = false;
  private durationSubscription: Subscription = null;

  constructor(destination: Subscriber<R>,
              private durationSelector: (value: T) => Observable<number> | Promise<number>) {
    super(destination);
  }

  protected _next(value: T): void {
    try {
      const result = this.durationSelector.call(this, value);

      if (result) {
        this._tryNext(value, result);
      }
    } catch (err) {
      this.destination.error(err);
    }
  }

  protected _complete(): void {
    this.emitValue();
    this.destination.complete();
  }

  private _tryNext(value: T, duration: Observable<number> | Promise<number>): void {
    let subscription = this.durationSubscription;
    this.value = value;
    this.hasValue = true;
    if (subscription) {
      subscription.unsubscribe();
      this.remove(subscription);
    }

    subscription = subscribeToResult(this, duration);
    if (!subscription.isUnsubscribed) {
      this.add(this.durationSubscription = subscription);
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.emitValue();
  }

  notifyComplete(): void {
    this.emitValue();
  }

  emitValue(): void {
    if (this.hasValue) {
      const value = this.value;
      const subscription = this.durationSubscription;
      if (subscription) {
        this.durationSubscription = null;
        subscription.unsubscribe();
        this.remove(subscription);
      }
      this.value = null;
      this.hasValue = false;
      super._next(value);
    }
  }
}
