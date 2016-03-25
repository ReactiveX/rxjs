import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Returns an Observable that, when the specified sampler Observable emits an item or completes, it then emits the most
 * recently emitted item (if any) emitted by the source Observable since the previous emission from the sampler
 * Observable.
 *
 * <img src="./img/sample.png" width="100%">
 *
 * @param {Observable} sampler - the Observable to use for sampling the source Observable.
 * @return {Observable<T>} an Observable that emits the results of sampling the items emitted by this Observable
 * whenever the sampler Observable emits an item or completes.
 * @method sample
 * @owner Observable
 */
export function sample<T>(notifier: Observable<any>): Observable<T> {
  return this.lift(new SampleOperator(notifier));
}

export interface SampleSignature<T> {
  (notifier: Observable<any>): Observable<T>;
}

class SampleOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new SampleSubscriber(subscriber, this.notifier));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SampleSubscriber<T, R> extends OuterSubscriber<T, R> {
  private value: T;
  private hasValue: boolean = false;

  constructor(destination: Subscriber<any>, notifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, notifier));
  }

  protected _next(value: T) {
    this.value = value;
    this.hasValue = true;
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
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
