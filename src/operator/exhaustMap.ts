import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';
import {_IndexSelector, ObservableInput, _OuterInnerMapResultSelector} from '../types';

export function exhaustMap<T, R, TResult>(project: _IndexSelector<T, ObservableInput<R>>,
                                          resultSelector?: _OuterInnerMapResultSelector<T, R, TResult>): Observable<TResult> {
  return this.lift(new SwitchFirstMapOperator(project, resultSelector));
}

class SwitchFirstMapOperator<T, R, TResult> implements Operator<T, TResult> {
  constructor(private project: _IndexSelector<T, ObservableInput<R>>,
              private resultSelector?: _OuterInnerMapResultSelector<T, R, TResult>) {
  }

  call(subscriber: Subscriber<TResult>): Subscriber<T> {
    return new SwitchFirstMapSubscriber(subscriber, this.project, this.resultSelector);
  }
}

class SwitchFirstMapSubscriber<T, R, TResult> extends OuterSubscriber<T, R> {
  private hasSubscription: boolean = false;
  private hasCompleted: boolean = false;
  private index: number = 0;

  constructor(destination: Subscriber<TResult>,
              private project: _IndexSelector<T, ObservableInput<R>>,
              private resultSelector?: _OuterInnerMapResultSelector<T, R, TResult>) {
    super(destination);
  }

  _next(value: T): void {
    if (!this.hasSubscription) {
      const index = this.index++;
      const destination = this.destination;
      let result = tryCatch(this.project)(value, index);
      if (result as any === errorObject) {
        destination.error(errorObject.e);
      } else {
        this.hasSubscription = true;
        this.add(subscribeToResult(this, result, value, index));
      }
    }
  }

  _complete(): void {
    this.hasCompleted = true;
    if (!this.hasSubscription) {
      this.destination.complete();
    }
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

  notifyError(err: any): void {
    this.destination.error(err);
  }

  notifyComplete(): void {
    this.hasSubscription = false;
    if (this.hasCompleted) {
      this.destination.complete();
    }
  }
}
