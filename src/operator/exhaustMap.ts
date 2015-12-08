import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function exhaustMap<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                     resultSelector?: (outerValue: T,
                                                       innerValue: R,
                                                       outerIndex: number,
                                                       innerIndex: number) => R2): Observable<R> {
  return this.lift(new SwitchFirstMapOperator(project, resultSelector));
}

class SwitchFirstMapOperator<T, R, R2> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T,
                                        innerValue: R,
                                        outerIndex: number,
                                        innerIndex: number) => R2) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchFirstMapSubscriber(subscriber, this.project, this.resultSelector);
  }
}

class SwitchFirstMapSubscriber<T, R, R2> extends OuterSubscriber<T, R> {
  private hasSubscription: boolean = false;
  private hasCompleted: boolean = false;
  private index: number = 0;

  constructor(destination: Subscriber<R>,
              private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2) {
    super(destination);
  }

  _next(value: T): void {
    if (!this.hasSubscription) {
      const index = this.index++;
      const destination = this.destination;
      let result = tryCatch(this.project)(value, index);
      if (result === errorObject) {
        destination.error(result.e);
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
      if (result === errorObject) {
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
