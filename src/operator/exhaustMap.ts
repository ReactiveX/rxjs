import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Returns an Observable that applies the given function to each item of the source Observable
 * to create a new Observable, which are then concatenated together to produce a new Observable.
 * @param {function} project function called for each item of the source to produce a new Observable.
 * @param {function} [resultSelector] optional function for then selecting on each inner Observable.
 * @returns {Observable} an Observable containing all the projected Observables of each item of the source concatenated together.
 */
export function exhaustMap<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                     resultSelector?: (
                                            outerValue: T,
                                            innerValue: R,
                                            outerIndex: number,
                                            innerIndex: number) => R2): Observable<R2> {
  return this.lift(new SwitchFirstMapOperator(project, resultSelector));
}

class SwitchFirstMapOperator<T, R, R2> implements Operator<T, R2> {
  constructor(private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2) {
  }

  call(subscriber: Subscriber<R2>): Subscriber<T> {
    return new SwitchFirstMapSubscriber(subscriber, this.project, this.resultSelector);
  }
}

class SwitchFirstMapSubscriber<T, R, R2> extends OuterSubscriber<T, R> {
  private hasSubscription: boolean = false;
  private hasCompleted: boolean = false;
  private index: number = 0;

  constructor(destination: Subscriber<R2>,
              private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2) {
    super(destination);
  }

  protected _next(value: T): void {
    if (!this.hasSubscription) {
      const index = this.index++;
      const destination = this.destination;
      let result = tryCatch(this.project)(value, index);
      if (result === errorObject) {
        destination.error(errorObject.e);
      } else {
        this.hasSubscription = true;
        this.add(subscribeToResult(this, result, value, index));
      }
    }
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (!this.hasSubscription) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
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
