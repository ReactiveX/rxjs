import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { Subscription, TeardownLogic } from '../Subscription';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * Returns an Observable that emits the same values as the source observable with the exception of an `error`.
 * An `error` will cause the emission of the Throwable that cause the error to the Observable returned from
 * notificationHandler. If that Observable calls onComplete or `error` then retry will call `complete` or `error`
 * on the child subscription. Otherwise, this Observable will resubscribe to the source observable, on a particular
 * Scheduler.
 *
 * <img src="./img/retryWhen.png" width="100%">
 *
 * @param {notificationHandler} receives an Observable of notifications with which a user can `complete` or `error`,
 * aborting the retry.
 * @param {scheduler} the Scheduler on which to subscribe to the source Observable.
 * @return {Observable} the source Observable modified with retry logic.
 * @method retryWhen
 * @owner Observable
 */
export function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>): Observable<T> {
  return this.lift(new RetryWhenOperator(notifier, this));
}

export interface RetryWhenSignature<T> {
  (notifier: (errors: Observable<any>) => Observable<any>): Observable<T>;
}

class RetryWhenOperator<T> implements Operator<T, T> {
  constructor(protected notifier: (errors: Observable<any>) => Observable<any>,
              protected source: Observable<T>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source._subscribe(new RetryWhenSubscriber(subscriber, this.notifier, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class RetryWhenSubscriber<T, R> extends OuterSubscriber<T, R> {

  private errors: Subject<any>;
  private retries: Observable<any>;
  private retriesSubscription: Subscription;

  constructor(destination: Subscriber<R>,
              private notifier: (errors: Observable<any>) => Observable<any>,
              private source: Observable<T>) {
    super(destination);
  }

  error(err: any) {
    if (!this.isStopped) {

      let errors = this.errors;
      let retries: any = this.retries;
      let retriesSubscription = this.retriesSubscription;

      if (!retries) {
        errors = new Subject();
        retries = tryCatch(this.notifier)(errors);
        if (retries === errorObject) {
          return super.error(errorObject.e);
        }
        retriesSubscription = subscribeToResult(this, retries);
      } else {
        this.errors = null;
        this.retriesSubscription = null;
      }

      this.unsubscribe();
      this.closed = false;

      this.errors = errors;
      this.retries = retries;
      this.retriesSubscription = retriesSubscription;

      errors.next(err);
    }
  }

  protected _unsubscribe() {
    const { errors, retriesSubscription } = this;
    if (errors) {
      errors.unsubscribe();
      this.errors = null;
    }
    if (retriesSubscription) {
      retriesSubscription.unsubscribe();
      this.retriesSubscription = null;
    }
    this.retries = null;
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {

    const { errors, retries, retriesSubscription } = this;
    this.errors = null;
    this.retries = null;
    this.retriesSubscription = null;

    this.unsubscribe();
    this.isStopped = false;
    this.closed = false;

    this.errors = errors;
    this.retries = retries;
    this.retriesSubscription = retriesSubscription;

    this.source.subscribe(this);
  }
}
