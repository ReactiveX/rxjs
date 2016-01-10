import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Returns an Observable that, when the specified sampler Observable emits an item or completes, it then emits the most
 * recently emitted item (if any) emitted by the source Observable since the previous emission from the sampler
 * Observable.
 *
 * <img src="./img/sample.png" width="100%">
 *
 * @param {Observable} sampler - the Observable to use for sampling the source Observable.
 * @returns {Observable<T>} an Observable that emits the results of sampling the items emitted by this Observable
 * whenever the sampler Observable emits an item or completes.
 */
export function sample<T>(notifier: Observable<any>): Observable<T> {
  return this.lift(new SampleOperator(notifier));
}

class SampleOperator<T, R> implements Operator<T, R> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<R>) {
    return new SampleSubscriber(subscriber, this.notifier);
  }
}

class SampleSubscriber<T, R> extends OuterSubscriber<T, R> {
  private value: T;
  private hasValue: boolean = false;

  constructor(destination: Subscriber<any>, notifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, notifier));
  }

  _next(value: T) {
    this.value = value;
    this.hasValue = true;
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this.emitValue();
  }

  notifyComplete(): void {
    this.emitValue();
  }

  emitValue() {
    if (this.hasValue) {
      this.hasValue = false;
      this.destination.next(this.value);
    }
  }
}
