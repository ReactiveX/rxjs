import {Operator} from '../Operator';
import {Observable, ObservableInput} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * @param observable
 * @param resultSelector
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method switchMapTo
 * @owner Observable
 */
export function switchMapTo<T, I, R>(observable: Observable<I>,
                                     resultSelector?: (outerValue: T,
                                                       innerValue: I,
                                                       outerIndex: number,
                                                       innerIndex: number) => R): Observable<R> {
  return this.lift(new SwitchMapToOperator(observable, resultSelector));
}

export interface SwitchMapToSignature<T> {
  <R>(observable: ObservableInput<R>): Observable<R>;
  <I, R>(observable: ObservableInput<I>,
         resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R>;
}

class SwitchMapToOperator<T, I, R> implements Operator<T, I> {
  constructor(private observable: Observable<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
  }

  call(subscriber: Subscriber<I>): Subscriber<T> {
    return new SwitchMapToSubscriber(subscriber, this.observable, this.resultSelector);
  }
}

class SwitchMapToSubscriber<T, I, R> extends OuterSubscriber<T, I> {
  private index: number = 0;
  private innerSubscription: Subscription;

  constructor(destination: Subscriber<I>,
              private inner: Observable<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
    super(destination);
  }

  protected _next(value: any) {
    const innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
    }
    this.add(this.innerSubscription = subscribeToResult(this, this.inner, value, this.index++));
  }

  protected _complete() {
    const {innerSubscription} = this;
    if (!innerSubscription || innerSubscription.isUnsubscribed) {
      super._complete();
    }
  }

  protected _unsubscribe() {
    this.innerSubscription = null;
  }

  notifyComplete(innerSub: Subscription) {
    this.remove(innerSub);
    this.innerSubscription = null;
    if (this.isStopped) {
      super._complete();
    }
  }

  notifyNext(outerValue: T, innerValue: I,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, I>): void {
    const { resultSelector, destination } = this;
    if (resultSelector) {
      this.tryResultSelector(outerValue, innerValue, outerIndex, innerIndex);
    } else {
      destination.next(innerValue);
    }
  }

  private tryResultSelector(outerValue: T, innerValue: I,
                            outerIndex: number, innerIndex: number): void {
    const { resultSelector, destination } = this;
    let result: R;
    try {
      result = resultSelector(outerValue, innerValue, outerIndex, innerIndex);
    } catch (err) {
      destination.error(err);
      return;
    }

    destination.next(result);
  }
}
