import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';
import tryCatch from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { MergeMapSubscriber } from './mergeMap-support';

export default function switchMap<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                           resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2): Observable<R>{
  return this.lift(new SwitchMapOperator(project, resultSelector));
}

class SwitchMapOperator<T, R, R2> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchMapSubscriber(subscriber, this.project, this.resultSelector);
  }
}

class SwitchMapSubscriber<T, R, R2> extends Subscriber<T> {

  private innerSubscription: Subscription<T>;
  private hasCompleted = false;
  index: number = 0;
  
  constructor(destination: Observer<T>,
              private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2) {
    super(destination);
  }
  
  _next(value: any) {
    const index = this.index++;
    const destination = this.destination; 
    let result = tryCatch(this.project)(value, index);
    if(result === errorObject) {
      destination.error(result.e);
    } else {
      const innerSubscription = this.innerSubscription;
      if(innerSubscription) {
        innerSubscription.unsubscribe();
      }
      this.add(this.innerSubscription = result.subscribe(new InnerSwitchMapSubscriber(this, this.resultSelector, index, value)))
    }
  }
  
  _complete() {
    const innerSubscription = this.innerSubscription;
    this.hasCompleted = true;
    if(!innerSubscription || innerSubscription.isUnsubscribed) {
      this.destination.complete();
    }
  }
  
  notifyComplete(innerSub: Subscription<R>) {
    this.remove(innerSub);
    this.innerSubscription = null;
    if(this.hasCompleted) {
      this.destination.complete();
    }
  }
  
  notifyError(err: any) {
    this.destination.error(err);
  }
  
  notifyNext(value: T) {
    this.destination.next(value);
  }
}

class InnerSwitchMapSubscriber<T, R, R2> extends Subscriber<T> {
  private index: number = 0;
  
  constructor(private parent: SwitchMapSubscriber<T, R, R2>, 
    private resultSelector: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2,
    private outerIndex: number,
    private outerValue: any) {
    super();
  }
  
  _next(value: T) {
    const parent = this.parent;
    const index = this.index++;
    const resultSelector = this.resultSelector;
    if(resultSelector) {
      let result = tryCatch(resultSelector)(value, this.outerValue, index, this.outerIndex);
      if(result === errorObject) {
        parent.notifyError(result.e);
      } else {
        parent.notifyNext(result);
      }
    } else {
      parent.notifyNext(value);
    }
  }
  
  _error(err: T) {
    this.parent.notifyError(err);
  }
  
  _complete() {
    this.parent.notifyComplete(this);
  }
}
