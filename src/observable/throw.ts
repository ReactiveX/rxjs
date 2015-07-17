import Observable from '../Observable';
import Subscriber from '../Subscriber';

class ThrowObservable extends Observable {
  err:any;
  
  constructor(err:any) {
    super(null);
    this.err = err;
  }
  
  subscriber(subscriber: Subscriber) {
    subscriber.error(this.err);
  }
}

const EMPTY_THROW = new ThrowObservable(undefined);

export default function _throw(err:any=undefined):Observable {
  return err ? new ThrowObservable(err) : EMPTY_THROW;
};
