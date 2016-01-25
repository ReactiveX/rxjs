import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';

/**
 * Returns an Observable that delays the emission of items from the source Observable
 * by a subscription delay and a delay selector function for each element.
 * @param {Function} selector function to retrieve a sequence indicating the delay for each given element.
 * @param {Observable} sequence indicating the delay for the subscription to the source.
 * @returns {Observable} an Observable that delays the emissions of the source Observable by the specified timeout or Date.
 */

export function delayWhen<T>(delayDurationSelector: (value: T) => Observable<any>,
                             subscriptionDelay?: Observable<any>): Observable<T> {
  if (subscriptionDelay) {
    return new SubscriptionDelayObservable(this, subscriptionDelay)
            .lift(new DelayWhenOperator(delayDurationSelector));
  }
  return this.lift(new DelayWhenOperator(delayDurationSelector));
}

class DelayWhenOperator<T> implements Operator<T, T> {
  constructor(private delayDurationSelector: (value: T) => Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DelayWhenSubscriber(subscriber, this.delayDurationSelector);
  }
}

class DelayWhenSubscriber<T> extends Subscriber<T> {
  private completed: boolean = false;
  private delayNotifierSubscriptions: Array<Subscription> = [];

  constructor(destination: Subscriber<T>,
              private delayDurationSelector: (value: T) => Observable<any>) {
    super(destination);
  }

  notifyNext(value: T, subscription: Subscription): void {
    this.destination.next(value);

    const subscriptionIdx = this.delayNotifierSubscriptions.indexOf(subscription);
    if (subscriptionIdx !== -1) {
      this.delayNotifierSubscriptions.splice(subscriptionIdx, 1);
    }

    this.tryComplete();
  }

  protected _next(value: T): void {
    try {
      const delayNotifier = this.delayDurationSelector(value);
      if (delayNotifier) {
        this._tryNext(delayNotifier, value);
      }
    } catch (err) {
        this.destination.error(err);
    }
  }

  protected _complete(): void {
    this.completed = true;
    this.tryComplete();
  }

  private _tryNext(delayNotifier: Observable<any>, value: T): void {
    const notifierSubscription = new Subscription();
    notifierSubscription.add(delayNotifier.subscribe(new DelayNotifierSubscriber(this, value, notifierSubscription)));
    this.add(notifierSubscription);
    this.delayNotifierSubscriptions.push(notifierSubscription);
  }

  private tryComplete(): void {
    if (this.completed && this.delayNotifierSubscriptions.length === 0) {
      this.destination.complete();
    }
  }
}

class DelayNotifierSubscriber<T> extends Subscriber<T> {
  constructor(private parent: DelayWhenSubscriber<T>, private value: T, private subscription: Subscription) {
    super();
  }

  protected _next(unused: any) {
    this.emitValue();
  }

  protected _error(err: any) {
    this.parent.error(err);
  }

  protected _complete() {
    this.emitValue();
  }

  private emitValue(): void {
    if (!this.isUnsubscribed) {
      this.unsubscribe();
      this.parent.notifyNext(this.value, this.subscription);
    }
  }
}

class SubscriptionDelayObservable<T> extends Observable<T> {
  constructor(protected source: Observable<T>, private subscriptionDelay: Observable<any>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    this.subscriptionDelay.subscribe(new SubscriptionDelaySubscriber(subscriber, this.source));
  }
}

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