import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';
import {_IndexSelector, ObservableInput, _OuterInnerMapResultSelector} from '../types';

export function switchMap<T, R, TResult>(project: _IndexSelector<T, ObservableInput<R>>,
                                         resultSelector?: _OuterInnerMapResultSelector<T, R, TResult>): Observable<TResult> {
  return this.lift(new SwitchMapOperator(project, resultSelector));
}

class SwitchMapOperator<T, R, TResult> implements Operator<T, R> {
  constructor(private project: _IndexSelector<T, ObservableInput<R>>,
              private resultSelector?: _OuterInnerMapResultSelector<T, R, TResult>) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchMapSubscriber(subscriber, this.project, this.resultSelector);
  }
}

class SwitchMapSubscriber<T, R, TResult> extends OuterSubscriber<T, R> {
  private innerSubscription: Subscription<T>;
  private hasCompleted = false;
  private index: number = 0;

  constructor(destination: Subscriber<R>,
              private project: _IndexSelector<T, ObservableInput<R>>,
              private resultSelector?: _OuterInnerMapResultSelector<T, R, TResult>) {
    super(destination);
  }

  _next(value: T): void {
    const index = this.index++;
    const destination = this.destination;
    let result = tryCatch(this.project)(value, index);
    if (result as any === errorObject) {
      destination.error(errorObject.e);
    } else {
      const innerSubscription = this.innerSubscription;
      if (innerSubscription) {
        innerSubscription.unsubscribe();
      }
      this.add(this.innerSubscription = subscribeToResult(this, result, value, index));
    }
  }

  _complete(): void {
    const innerSubscription = this.innerSubscription;
    this.hasCompleted = true;
    if (!innerSubscription || innerSubscription.isUnsubscribed) {
      this.destination.complete();
    }
  }

  notifyComplete(innerSub: Subscription<R>): void {
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

  notifyError(err: any): void {
    this.destination.error(err);
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
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
