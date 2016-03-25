import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';

import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Returns an Observable that delays the emission of items from the source Observable
 * by a subscription delay and a delay selector function for each element.
 * @param {Function} selector function to retrieve a sequence indicating the delay for each given element.
 * @param {Observable} sequence indicating the delay for the subscription to the source.
 * @return {Observable} an Observable that delays the emissions of the source Observable by the specified timeout or Date.
 * @method delayWhen
 * @owner Observable
 */
export function delayWhen<T>(delayDurationSelector: (value: T) => Observable<any>,
                             subscriptionDelay?: Observable<any>): Observable<T> {
  if (subscriptionDelay) {
    return new SubscriptionDelayObservable(this, subscriptionDelay)
            .lift(new DelayWhenOperator(delayDurationSelector));
  }
  return this.lift(new DelayWhenOperator(delayDurationSelector));
}

export interface DelayWhenSignature<T> {
  (delayDurationSelector: (value: T) => Observable<any>, subscriptionDelay?: Observable<any>): Observable<T>;
}

class DelayWhenOperator<T> implements Operator<T, T> {
  constructor(private delayDurationSelector: (value: T) => Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new DelayWhenSubscriber(subscriber, this.delayDurationSelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DelayWhenSubscriber<T, R> extends OuterSubscriber<T, R> {
  private completed: boolean = false;
  private delayNotifierSubscriptions: Array<Subscription> = [];
  private values: Array<T> = [];

  constructor(destination: Subscriber<T>,
              private delayDurationSelector: (value: T) => Observable<any>) {
    super(destination);
  }

  notifyNext(outerValue: T, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.destination.next(outerValue);
    this.removeSubscription(innerSub);
    this.tryComplete();
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, R>): void {
    this._error(error);
  }

  notifyComplete(innerSub: InnerSubscriber<T, R>): void {
    const value = this.removeSubscription(innerSub);
    if (value) {
      this.destination.next(value);
    }
    this.tryComplete();
  }

  protected _next(value: T): void {
    try {
      const delayNotifier = this.delayDurationSelector(value);
      if (delayNotifier) {
        this.tryDelay(delayNotifier, value);
      }
    } catch (err) {
        this.destination.error(err);
    }
  }

  protected _complete(): void {
    this.completed = true;
    this.tryComplete();
  }

  private removeSubscription(subscription: InnerSubscriber<T, R>): T {
    subscription.unsubscribe();

    const subscriptionIdx = this.delayNotifierSubscriptions.indexOf(subscription);
    let value: T = null;

    if (subscriptionIdx !== -1) {
      value = this.values[subscriptionIdx];
      this.delayNotifierSubscriptions.splice(subscriptionIdx, 1);
      this.values.splice(subscriptionIdx, 1);
    }

    return value;
  }

  private tryDelay(delayNotifier: Observable<any>, value: T): void {
    const notifierSubscription = subscribeToResult(this, delayNotifier, value);
    this.add(notifierSubscription);

    this.delayNotifierSubscriptions.push(notifierSubscription);
    this.values.push(value);
  }

  private tryComplete(): void {
    if (this.completed && this.delayNotifierSubscriptions.length === 0) {
      this.destination.complete();
    }
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SubscriptionDelayObservable<T> extends Observable<T> {
  constructor(protected source: Observable<T>, private subscriptionDelay: Observable<any>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    this.subscriptionDelay.subscribe(new SubscriptionDelaySubscriber(subscriber, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SubscriptionDelaySubscriber<T> extends Subscriber<T> {
  private sourceSubscribed: boolean = false;

  constructor(private parent: Subscriber<T>, private source: Observable<T>) {
    super();
  }

  protected _next(unused: any) {
    this.subscribeToSource();
  }

  protected _error(err: any) {
    this.unsubscribe();
    this.parent.error(err);
  }

  protected _complete() {
    this.subscribeToSource();
  }

  private subscribeToSource(): void {
    if (!this.sourceSubscribed) {
      this.sourceSubscribed = true;
      this.unsubscribe();
      this.source.subscribe(this.parent);
    }
  }
}
