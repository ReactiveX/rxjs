import Observable from '../Observable';
import Observer from '../Observer';
import $$observer from '../util/Symbol_observer';

class ValueObservable extends Observable {
  value:any;
  
  constructor(value:any) {
    super(null);
    this.value = value;
  }
  
  [$$observer](observer:Observer) {
    observer.next(this.value);
    observer.complete();
  }
}

export default function value(value:any) : Observable {
  return new ValueObservable(value);
};
