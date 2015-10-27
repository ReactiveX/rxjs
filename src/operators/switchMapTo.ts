import Operator from '../Operator';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';
import tryCatch from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import OuterSubscriber from '../OuterSubscriber';
import subscribeToResult from '../util/subscribeToResult';

export default function switchMapTo<T, R, R2>(observable: Observable<R>,
                                              projectResult?: (outerValue: T,
                                                               innerValue: R,
                                                               outerIndex: number,
                                                               innerIndex: number) => R2): Observable<R2> {
  return this.lift(new SwitchMapToOperator(observable, projectResult));
}

class SwitchMapToOperator<T, R, R2> implements Operator<T, R> {
  constructor(private observable: Observable<R>,
              private resultSelector?: (outerValue: T,
                                        innerValue: R,
                                        outerIndex: number,
                                        innerIndex: number) => R2) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchMapToSubscriber(subscriber, this.observable, this.resultSelector);
  }
}

class SwitchMapToSubscriber<T, R, R2> extends OuterSubscriber<T, R> {
  private innerSubscription: Subscription<T>;
  private hasCompleted = false;
  index: number = 0;

  constructor(destination: Subscriber<R>,
              private inner: Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2) {
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
