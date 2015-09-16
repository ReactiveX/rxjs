import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';
import tryCatch from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { FlatMapSubscriber } from './flatMap-support';

export default function switchLatest<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                           resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2): Observable<R>{
  return this.lift(new SwitchLatestOperator(project, resultSelector));
}

class SwitchLatestOperator<T, R, R2> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchLatestSubscriber(subscriber, this.project, this.resultSelector);
  }
}

class SwitchLatestSubscriber<T, R, R2> extends Subscriber<T> {

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
      this.add(this.innerSubscription = result.subscribe(new InnerSwitchLatestSubscriber(destination, this, this.resultSelector, index, value)))
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
}

class InnerSwitchLatestSubscriber<T, R, R2> extends Subscriber<T> {
  private index: number = 0;
  
  constructor(destination: Observer<T>, private parent: SwitchLatestSubscriber<T, R, R2>, 
    private resultSelector: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2,
    private outerIndex: number,
    private outerValue: any) {
    super(destination);
  }
  
  _next(value: T) {
    const destination = this.destination;
    const index = this.index++;
    const resultSelector = this.resultSelector;
    if(resultSelector) {
      let result = tryCatch(resultSelector)(value, this.outerValue, index, this.outerIndex);
      if(result === errorObject) {
        destination.error(result.e);
      } else {
        destination.next(result);
      }
    } else {
      destination.next(value);
    }
  }
  
  _complete() {
    this.parent.notifyComplete(this);
  }
}
