import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function switchMapTo<T, R, R2>(observable: Observable<R>,
                                      resultSelector?: (
                                                 outerValue: T,
                                                 innerValue: R,
                                                 outerIndex: number,
                                                 innerIndex: number) => R2): Observable<R2> {
  return this.lift(new SwitchMapToOperator(observable, resultSelector));
}

class SwitchMapToOperator<T, R, R2> implements Operator<T, R> {
  constructor(private observable: Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchMapToSubscriber(subscriber, this.observable, this.resultSelector);
  }
}

class SwitchMapToSubscriber<T, R, R2> extends OuterSubscriber<T, R> {
  private index: number = 0;
  private innerSubscription: Subscription;

  constructor(destination: Subscriber<R>,
              private inner: Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2) {
    super(destination);
  }

  _next(value: any) {
    const innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
    }
    this.add(this.innerSubscription = subscribeToResult(this, this.inner, value, this.index++));
  }

  _complete() {
    const {innerSubscription} = this;
    if (!innerSubscription || innerSubscription.isUnsubscribed) {
      super._complete();
    }
  }

  _unsubscribe() {
    this.innerSubscription = null;
  }

  notifyComplete(innerSub: Subscription) {
    this.remove(innerSub);
    this.innerSubscription = null;
    if (this.isStopped) {
      super._complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) {
    const { resultSelector, destination } = this;
    if (resultSelector) {
      const result = tryCatch(resultSelector)(outerValue, innerValue, outerIndex, innerIndex);
      if (result === errorObject) {
        destination.error(errorObject.e);
      } else {
        destination.next(result);
      }
    } else {
      destination.next(innerValue);
    }
  }
}
