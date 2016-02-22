import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Converts an Observable that emits Observables into an Observable that emits the items emitted by the most recently
 * emitted of those Observables.
 *
 * <img src="./img/switch.png" width="100%">
 *
 * Switch subscribes to an Observable that emits Observables. Each time it observes one of these emitted Observables,
 * the Observable returned by switchOnNext begins emitting the items emitted by that Observable. When a new Observable
 * is emitted, switchOnNext stops emitting items from the earlier-emitted Observable and begins emitting items from the
 * new one.
 *
 * @param {Function} a predicate function to evaluate items emitted by the source Observable.
 * @return {Observable<T>} an Observable that emits the items emitted by the Observable most recently emitted by the
 * source Observable.
 * @method switch
 * @owner Observable
 */
export function _switch<T>(): T {
  return this.lift(new SwitchOperator());
}

export interface SwitchSignature<T> {
  (): T;
}

class SwitchOperator<T, R> implements Operator<T, R> {
  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchSubscriber(subscriber);
  }
}

class SwitchSubscriber<T, R> extends OuterSubscriber<T, R> {
  private active: number = 0;
  private hasCompleted: boolean = false;
  innerSubscription: Subscription;

  constructor(destination: Subscriber<R>) {
    super(destination);
  }

  protected _next(value: T): void {
    this.unsubscribeInner();
    this.active++;
    this.add(this.innerSubscription = subscribeToResult(this, value));
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (this.active === 0) {
      this.destination.complete();
    }
  }

  private unsubscribeInner(): void {
    this.active = this.active > 0 ? this.active - 1 : 0;
    const innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
      this.remove(innerSubscription);
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.destination.next(innerValue);
  }

  notifyError(err: any): void {
    this.destination.error(err);
  }

  notifyComplete(): void {
    this.unsubscribeInner();
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }
}
