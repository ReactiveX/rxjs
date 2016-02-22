import {Operator} from '../Operator';
import {Observable, ObservableInput} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Returns an Observable that applies the given function to each item of the source Observable
 * to create a new Observable, which are then concatenated together to produce a new Observable.
 * @param {function} project function called for each item of the source to produce a new Observable.
 * @param {function} [resultSelector] optional function for then selecting on each inner Observable.
 * @return {Observable} an Observable containing all the projected Observables of each item of the source concatenated together.
 * @method exhaustMap
 * @owner Observable
 */
export function exhaustMap<T, I, R>(project: (value: T, index: number) => ObservableInput<I>,
                                    resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R> {
  return this.lift(new SwitchFirstMapOperator(project, resultSelector));
}

export interface SwitchFirstMapSignature<T> {
  <R>(project: (value: T, index: number) => ObservableInput<R>): Observable<R>;
  <I, R>(project: (value: T, index: number) => ObservableInput<I>,
         resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R>;
}

class SwitchFirstMapOperator<T, I, R> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => ObservableInput<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchFirstMapSubscriber(subscriber, this.project, this.resultSelector);
  }
}

class SwitchFirstMapSubscriber<T, I, R> extends OuterSubscriber<T, I> {
  private hasSubscription: boolean = false;
  private hasCompleted: boolean = false;
  private index: number = 0;

  constructor(destination: Subscriber<R>,
              private project: (value: T, index: number) => ObservableInput<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
    super(destination);
  }

  protected _next(value: T): void {
    if (!this.hasSubscription) {
      this.tryNext(value);
    }
  }

  private tryNext(value: T): void {
    const index = this.index++;
    const destination = this.destination;
    try {
      const result = this.project(value, index);
      this.hasSubscription = true;
      this.add(subscribeToResult(this, result, value, index));
    } catch (err) {
      destination.error(err);
    }
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (!this.hasSubscription) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: I,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, I>): void {
    const { resultSelector, destination } = this;
    if (resultSelector) {
      this.trySelectResult(outerValue, innerValue, outerIndex, innerIndex);
    } else {
      destination.next(innerValue);
    }
  }

  private trySelectResult(outerValue: T, innerValue: I,
                          outerIndex: number, innerIndex: number): void {
    const { resultSelector, destination } = this;
    try {
      const result = resultSelector(outerValue, innerValue, outerIndex, innerIndex);
      destination.next(result);
    } catch (err) {
      destination.error(err);
    }
  }

  notifyError(err: any): void {
    this.destination.error(err);
  }

  notifyComplete(innerSub: Subscription): void {
    this.remove(innerSub);

    this.hasSubscription = false;
    if (this.hasCompleted) {
      this.destination.complete();
    }
  }
}
