import Observable from '../Observable';
import Subscriber from '../Subscriber';

export default class PromiseObservable<T> extends Observable<T> {

  static create<T>(promise: Promise<T>) {
    return new PromiseObservable(promise);
  }

  constructor(protected promise: Promise<T>) {
    super();
  }

  _subscribe(subscriber: Subscriber<T>) {
    this.promise.then(
      (x) => {
        if(!subscriber.isUnsubscribed) {
          subscriber.next(x);
          subscriber.complete();
        }
      },
      (e) => {
        if(!subscriber.isUnsubscribed) {
          subscriber.error(e);
        }
      }
    );
  }
}
