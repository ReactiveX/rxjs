import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function switchMap<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                    resultSelector?: (outerValue: T,
                                                      innerValue: R,
                                                      outerIndex: number,
                                                      innerIndex: number) => R2): Observable<R> {
  return this.lift(new SwitchMapOperator(project, resultSelector));
}

class SwitchMapOperator<T, R, R2> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T,
                                        innerValue: R,
                                        outerIndex: number,
                                        innerIndex: number) => R2) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchMapSubscriber(subscriber, this.project, this.resultSelector);
  }
}

class SwitchMapSubscriber<T, R, R2> extends OuterSubscriber<T, R> {
  private index: number = 0;
  private innerSubscription: Subscription;

  constructor(destination: Subscriber<R>,
              private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2) {
    super(destination);
  }

  _next(value: T): void {
    const index = this.index++;
    const destination = this.destination;
    let result = tryCatch(this.project)(value, index);
    if (result === errorObject) {
      destination.error(result.e);
    } else {
      const innerSubscription = this.innerSubscription;
      if (innerSubscription) {
        innerSubscription.unsubscribe();
      }
      this.add(this.innerSubscription = subscribeToResult(this, result, value, index));
    }
  }

  _complete(): void {
    const {innerSubscription} = this;
    if (!innerSubscription || innerSubscription.isUnsubscribed) {
      super._complete();
    }
  }

  _unsubscribe() {
    this.innerSubscription = null;
  }

  notifyComplete(innerSub: Subscription): void {
    this.remove(innerSub);
    this.innerSubscription = null;
    if (this.isStopped) {
      super._complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
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
