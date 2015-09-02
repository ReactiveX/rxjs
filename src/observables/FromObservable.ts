import PromiseObservable from './PromiseObservable';
import IteratorObservable from'./IteratorObservable';
import ArrayObservable from './ArrayObservable';

import isArray from '../util/isArray';
import isPromise from '../util/isPromise';
import isObservable from '../util/isObservable';
import Scheduler from '../Scheduler';
import $$observer from '../util/Symbol_observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import { ObserveOnSubscriber } from '../operators/observeOn-support';
import immediate from '../schedulers/immediate';

export default class FromObservable<T> extends Observable<T> {
  constructor(private observablesque: any, private scheduler: Scheduler) {
    super(null);
  }
  
  static create<T>(observablesque: any, scheduler: Scheduler = immediate): Observable<T> {
    if (isArray(observablesque)) {
      return new ArrayObservable(observablesque, scheduler);
    } else if (isPromise(observablesque)) {
      return new PromiseObservable(observablesque, scheduler);
    } else if (isObservable(observablesque)) {
      if(observablesque instanceof Observable) {
        return observablesque;
      }
      return new FromObservable(observablesque, scheduler);
    } else {
      return new IteratorObservable(observablesque, null, null, scheduler);
    }
  }
  
  _subscribe(subscriber: Subscriber<T>) {
    const observablesque = this.observablesque;
    const scheduler = this.scheduler;
    if(scheduler === immediate) {
      return this.observablesque[$$observer](subscriber);
    } else {
      return this.observablesque[$$observer](new ObserveOnSubscriber(subscriber, scheduler, 0));
    }
  }
}