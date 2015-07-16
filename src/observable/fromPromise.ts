import Observable from '../Observable';
import Subscriber from '../Subscriber';

class PromiseObservable extends Observable {
  promise: Promise<any>;
  
  constructor(promise: Promise<any>) {
    super(null);
    this.promise = promise; 
  }
  
  subscriber(subscriber:Subscriber) {
    var promise = this.promise;
    if(promise) {
      promise.then(x => {
        if(!subscriber.isUnsubscribed) {
          subscriber.next(x);
          subscriber.complete();
        }
      }, e => {
        if(!subscriber.isUnsubscribed) {
          subscriber.error(e);
        }
      });
    }
  }
}

export default function fromPromise(promise: Promise<any>) : Observable {
  return new PromiseObservable(promise);
}
