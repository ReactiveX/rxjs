import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subject} from '../Subject';
import {Subscription} from '../Subscription';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>) {
  return this.lift(new RetryWhenOperator(notifier, this));
}

class RetryWhenOperator<T, R> implements Operator<T, R> {
  constructor(protected notifier: (errors: Observable<any>) => Observable<any>,
              protected source: Observable<T>) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new RetryWhenSubscriber(subscriber, this.notifier, this.source);
  }
}

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
      this.isUnsubscribed = false;

      this.errors = errors;
      this.retries = retries;
      this.retriesSubscription = retriesSubscription;

      errors.next(err);
    }
  }

  _unsubscribe() {
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

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {

    const { errors, retries, retriesSubscription } = this;
    this.errors = null;
    this.retries = null;
    this.retriesSubscription = null;

    this.unsubscribe();
    this.isStopped = false;
    this.isUnsubscribed = false;

    this.errors = errors;
    this.retries = retries;
    this.retriesSubscription = retriesSubscription;

    this.source.subscribe(this);
  }
}
