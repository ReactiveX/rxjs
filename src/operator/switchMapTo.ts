import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';
import {_OuterInnerMapResultSelector} from '../types';

export function switchMapTo<T, R, TResult>(observable: Observable<R>,
                                           resultSelector?: _OuterInnerMapResultSelector<T, R, TResult>): Observable<TResult> {
  return this.lift(new SwitchMapToOperator(observable, resultSelector));
}

class SwitchMapToOperator<T, R, TResult> implements Operator<T, R> {
  constructor(private observable: Observable<R>,
              private resultSelector?: _OuterInnerMapResultSelector<T, R, TResult>) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchMapToSubscriber(subscriber, this.observable, this.resultSelector);
  }
}

class SwitchMapToSubscriber<T, R, TResult> extends OuterSubscriber<T, R> {
  private innerSubscription: Subscription<T>;
  private hasCompleted = false;
  index: number = 0;

  constructor(destination: Subscriber<R>,
              private inner: Observable<R>,
              private resultSelector?: _OuterInnerMapResultSelector<T, R, TResult>) {
    super(destination);
  }

  _next(value: any) {
    const index = this.index++;
    const innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
    }
    this.add(this.innerSubscription = subscribeToResult(this, this.inner, value, index));
  }

  _complete() {
    const innerSubscription = this.innerSubscription;
    this.hasCompleted = true;
    if (!innerSubscription || innerSubscription.isUnsubscribed) {
      this.destination.complete();
    }
  }

  notifyComplete(innerSub: Subscription<R>) {
    this.remove(innerSub);
    const prevSubscription = this.innerSubscription;
    if (prevSubscription) {
      prevSubscription.unsubscribe();
    }
    this.innerSubscription = null;

    if (this.hasCompleted) {
      this.destination.complete();
    }
  }

  notifyError(err: any) {
    this.destination.error(err);
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) {
    const { resultSelector, destination } = this;
    if (resultSelector) {
      const result = tryCatch(resultSelector)(outerValue, innerValue, outerIndex, innerIndex);
      if (result as any === errorObject) {
        destination.error(errorObject.e);
      } else {
        destination.next(result);
      }
    } else {
      destination.next(innerValue);
    }
  }
}
