import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';
import tryCatch from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { MergeMapSubscriber } from './mergeMap-support';
import OuterSubscriber from '../OuterSubscriber';
import subscribeToResult from '../util/subscribeToResult';

export default function switchMap<T, R, R2>(project: (value: T, index: number) => Observable<R>,
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

  private innerSubscription: Subscription<T>;
  private hasCompleted = false;
  index: number = 0;

  constructor(destination: Observer<T>,
              private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2) {
    super(destination);
  }

  _next(value: any) {
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
