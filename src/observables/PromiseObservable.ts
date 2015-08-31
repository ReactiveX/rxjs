import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Scheduler from '../Scheduler';
import Subscription from '../Subscription';

export default class PromiseObservable<T> extends Observable<T> {

  static create<T>(promise: Promise<T>, scheduler: Scheduler = Scheduler.immediate) {
    return new PromiseObservable(promise, scheduler);
  }

  constructor(private promise: Promise<T>, private scheduler: Scheduler) {
    super();
  }

  _subscribe(subscriber: Subscriber<T>) {
    const scheduler = this.scheduler;
    const promise = this.promise;
    
    if (scheduler === Scheduler.immediate) {
      promise.then(value => {
          subscriber.next(value);
          subscriber.complete();
        },
        err => subscriber.error(err));
    } else {
      let subscription = new Subscription();
      promise.then(value => subscription.add(scheduler.schedule(0, { value, subscriber }, dispatchNext)),
      err => subscription.add(scheduler.schedule(0, { err, subscriber }, dispatchError)));
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
