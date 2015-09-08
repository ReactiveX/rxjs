import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Scheduler from '../Scheduler';
import Subscription from '../Subscription';
import immediate from '../schedulers/immediate';

export default class PromiseObservable<T> extends Observable<T> {

  _isScalar: boolean = false;
  value: T;
  
  static create<T>(promise: Promise<T>, scheduler: Scheduler = immediate) {
    return new PromiseObservable(promise, scheduler);
  }

  constructor(private promise: Promise<T>, private scheduler: Scheduler) {
    super();
  }

  _subscribe(subscriber: Subscriber<T>) {
    const scheduler = this.scheduler;
    const promise = this.promise;
    
    if (scheduler === immediate) {
      if (this._isScalar) {
        subscriber.next(this.value);
        subscriber.complete();
      } else {
        promise.then(value => {
          this._isScalar = true;
          this.value = value;
          subscriber.next(value);
          subscriber.complete();
        }, err => subscriber.error(err));
      }
    } else {
      let subscription = new Subscription();
      if (this._isScalar) {
        const value = this.value;
        subscription.add(scheduler.schedule(dispatchNext, 0, { value, subscriber }))
      } else {
        promise.then(value => {
          this._isScalar = true;
          this.value = value;
          subscription.add(scheduler.schedule(dispatchNext, 0, { value, subscriber }))
        }, err => subscription.add(scheduler.schedule(dispatchError, 0, { err, subscriber })));
      }  
      return subscription;
    }
  }
}

function dispatchNext({ value, subscriber }) {
  subscriber.next(value);
  subscriber.complete();
}

function dispatchError({ err, subscriber }) {
  subscriber.error(err);
}
