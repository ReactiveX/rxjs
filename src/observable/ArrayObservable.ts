import Observable from '../Observable';
import Subscriber from '../Subscriber';

export default class ArrayObservable extends Observable {
  array:Array<any>;
  
  constructor(array: Array<any>) {
    super(null);
    this.array = array;
  }
  
  subscriber(subscriber: Subscriber) {
    var i, len;
    var array = this.array;
    if(Array.isArray(array)) {
      for(i = 0, len = array.length; i < len && !subscriber.isUnsubscribed; i++) {
        subscriber.next(array[i]);
      }
    }
    if(subscriber.complete) subscriber.complete();
  }
}