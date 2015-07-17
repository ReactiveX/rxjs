import Observable from '../Observable';
import Subscriber from '../Subscriber';

class ValueObservable extends Observable {
  value:any;
  
  constructor(value:any) {
    super(null);
    this.value = value;
  }
  
  subscriber(subscriber:Subscriber) {
    subscriber.next(this.value);
    subscriber.complete();
  }
}

export default function value(value:any) : Observable {
  return new ValueObservable(value);
};
