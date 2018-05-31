import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { MonoTypeOperatorFunction, SubscribableOrPromise, TeardownLogic } from '../types';

import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * Ignores source values for a duration determined by another Observable, then
 * emits the most recent value from the source Observable, then repeats this
 * process.
 *
 * <span class="informal">It's like {@link auditTime}, but the silencing
 * duration is determined by a second Observable.</span>
 *
 * <img src="./img/audit.png" width="100%">
 *
 * `audit` is similar to `throttle`, but emits the last value from the silenced
 * time window, instead of the first value. `audit` emits the most recent value
 * from the source Observable on the output Observable as soon as its internal
 * timer becomes disabled, and ignores source values while the timer is enabled.
 * Initially, the timer is disabled. As soon as the first source value arrives,
 * the timer is enabled by calling the `durationSelector` function with the
 * source value, which returns the "duration" Observable. When the duration
 * Observable emits a value or completes, the timer is disabled, then the most
 * recent source value is emitted on the output Observable, and this process
 * repeats for the next source value.
 *
 * @example <caption>Emit clicks at a rate of at most one click per second</caption>
 * var clicks = fromEvent(document, 'click');
 * var result = clicks.pipe(audit(ev => Rx.Observable.interval(1000)));
 * result.subscribe(x => console.log(x));
 *
 * @see {@link auditTime}
 * @see {@link debounce}
 * @see {@link delayWhen}
 * @see {@link sample}
 * @see {@link throttle}
 *
 * @param {function(value: T): SubscribableOrPromise} durationSelector A function
 * that receives a value from the source Observable, for computing the silencing
 * duration, returned as an Observable or a Promise.
 * @return {Observable<T>} An Observable that performs rate-limiting of
 * emissions from the source Observable.
 * @method audit
 * @owner Observable
 */
export function audit<T>(durationSelector: (value: T) => SubscribableOrPromise<any>): MonoTypeOperatorFunction<T> {
  return function auditOperatorFunction(source: Observable<T>) {
    return source.lift(new AuditOperator(durationSelector));
  };
}

class AuditOperator<T> implements Operator<T, T> {
  constructor(private durationSelector: (value: T) => SubscribableOrPromise<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new AuditSubscriber<T, T>(subscriber, this.durationSelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class AuditSubscriber<T, R> extends OuterSubscriber<T, R> {

  private value: T;
  private hasValue: boolean = false;
  private throttled: Subscription;

  constructor(destination: Subscriber<T>,
              private durationSelector: (value: T) => SubscribableOrPromise<any>) {
    super(destination);
  }

  protected _next(value: T): void {
    this.value = value;
    this.hasValue = true;
    if (!this.throttled) {
      const duration = tryCatch(this.durationSelector)(value);
      if (duration === errorObject) {
        this.destination.error(errorObject.e);
      } else {
        const innerSubscription = subscribeToResult(this, duration);
        if (!innerSubscription || innerSubscription.closed) {
          this.clearThrottle();
        } else {
          this.add(this.throttled = innerSubscription);
        }
      }
    }
  }

  clearThrottle() {
    const { value, hasValue, throttled } = this;
    if (throttled) {
      this.remove(throttled);
      this.throttled = null;
      throttled.unsubscribe();
    }
    if (hasValue) {
      this.value = null;
      this.hasValue = false;
      this.destination.next(value);
    }
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this.clearThrottle();
  }

  notifyComplete(): void {
    this.clearThrottle();
  }
}
