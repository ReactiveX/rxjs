import Observable from '../Observable';
import Observer from '../Observer';

export default class ArrayObservable extends Observable {
  array:Array<any>;
  
  constructor(array: Array<any>) {
    super(null);
    this.array = array;
  }
  
  subscriber(observer: Observer) {
    var i, len;
    var array = this.array;
    if(Array.isArray(array)) {
      for(i = 0, len = array.length; i < len && !observer.unsubscribed; i++) {
        observer.next(array[i]);
      }
    }
    if(observer.complete) observer.complete();
  }
}