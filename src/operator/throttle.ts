import {Operator} from '../Operator';
import {Observable, SubscribableOrPromise} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * @param durationSelector
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method throttle
 * @owner Observable
 */
export function throttle<T>(durationSelector: (value: T) => SubscribableOrPromise<number>): Observable<T> {
  return this.lift(new ThrottleOperator(durationSelector));
}

export interface ThrottleSignature<T> {
  (durationSelector: (value: T) => SubscribableOrPromise<number>): Observable<T>;
}

class ThrottleOperator<T> implements Operator<T, T> {
  constructor(private durationSelector: (value: T) => SubscribableOrPromise<number>) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new ThrottleSubscriber(subscriber, this.durationSelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ThrottleSubscriber<T, R> extends OuterSubscriber<T, R> {
  private throttled: Subscription;

  constructor(protected destination: Subscriber<T>,
              private durationSelector: (value: T) => SubscribableOrPromise<number>) {
    super(destination);
  }

  protected _next(value: T): void {
    if (!this.throttled) {
      this.tryDurationSelector(value);
    }
  }

  private tryDurationSelector(value: T): void {
    let duration: SubscribableOrPromise<number> = null;
    try {
      duration = this.durationSelector(value);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.emitAndThrottle(value, duration);
  }

  private emitAndThrottle(value: T, duration: SubscribableOrPromise<number>) {
    this.add(this.throttled = subscribeToResult(this, duration));
    this.destination.next(value);
  }

  protected _unsubscribe() {
    const throttled = this.throttled;
    if (throttled) {
      this.remove(throttled);
      this.throttled = null;
      throttled.unsubscribe();
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this._unsubscribe();
  }

  notifyComplete(): void {
    this._unsubscribe();
  }
}
