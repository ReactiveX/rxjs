import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {Subscription} from '../Subscription';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Returns an Observable where for each item in the source Observable, the supplied function is applied to each item,
 * resulting in a new value to then be applied again with the function.
 * @param {function} project the function for projecting the next emitted item of the Observable.
 * @param {number} [concurrent] the max number of observables that can be created concurrently. defaults to infinity.
 * @param {Scheduler} [scheduler] The Scheduler to use for managing the expansions.
 * @return {Observable} an Observable containing the expansions of the source Observable.
 * @method expand
 * @owner Observable
 */
export function expand<T, R>(project: (value: T, index: number) => Observable<R>,
                             concurrent: number = Number.POSITIVE_INFINITY,
                             scheduler: Scheduler = undefined): Observable<R> {
  concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;

  return this.lift(new ExpandOperator(project, concurrent, scheduler));
}

export interface ExpandSignature<T> {
  (project: (value: T, index: number) => Observable<T>, concurrent?: number, scheduler?: Scheduler): Observable<T>;
  <R>(project: (value: T, index: number) => Observable<R>, concurrent?: number, scheduler?: Scheduler): Observable<R>;
}

export class ExpandOperator<T, R> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => Observable<R>,
              private concurrent: number,
              private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source._subscribe(new ExpandSubscriber(subscriber, this.project, this.concurrent, this.scheduler));
  }
}

interface DispatchArg<T, R> {
  subscriber: ExpandSubscriber<T, R>;
  result: Observable<R>;
  value: any;
  index: number;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class ExpandSubscriber<T, R> extends OuterSubscriber<T, R> {
  private index: number = 0;
  private active: number = 0;
  private hasCompleted: boolean = false;
  private buffer: any[];

  constructor(destination: Subscriber<R>,
              private project: (value: T, index: number) => Observable<R>,
              private concurrent: number,
              private scheduler: Scheduler) {
    super(destination);
    if (concurrent < Number.POSITIVE_INFINITY) {
      this.buffer = [];
    }
  }

  private static dispatch<T, R>(arg: DispatchArg<T, R>): void {
    const {subscriber, result, value, index} = arg;
    subscriber.subscribeToProjection(result, value, index);
  }

  protected _next(value: any): void {
    const destination = this.destination;

    if (destination.isUnsubscribed) {
      this._complete();
      return;
    }

    const index = this.index++;
    if (this.active < this.concurrent) {
      destination.next(value);
      let result = tryCatch(this.project)(value, index);
      if (result === errorObject) {
        destination.error(errorObject.e);
      } else if (!this.scheduler) {
        this.subscribeToProjection(result, value, index);
      } else {
        const state: DispatchArg<T, R> = { subscriber: this, result, value, index };
        this.add(this.scheduler.schedule(ExpandSubscriber.dispatch, 0, state));
      }
    } else {
      this.buffer.push(value);
    }
  }

  private subscribeToProjection(result: any, value: T, index: number): void {
    this.active++;
    this.add(subscribeToResult<T, R>(this, result, value, index));
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this._next(innerValue);
  }

  notifyComplete(innerSub: Subscription): void {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if (buffer && buffer.length > 0) {
      this._next(buffer.shift());
    }
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }
}
