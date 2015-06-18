import Observable from '../Observable';
import Observer from '../Observer';

class ValueObservable extends Observable {
  value:any;
  
  constructor(value:any) {
    super(null);
    this.value = value;
  }
  
  subscriber(observer:Observer) {
    observer.next(this.value);
    observer.return();
  }
}

export default function value(value:any) : Observable {
    return new ValueObservable(value);
};
