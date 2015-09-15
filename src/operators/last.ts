import Observable from '../Observable';
import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observer from '../Observer';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';
import EmptyError from '../util/EmptyError';

export default function last<T>(predicate?: (value: T, index: number, source:Observable<T>) => boolean, thisArg?: any, defaultValue?: any) : Observable<T> {
  return this.lift(new LastOperator(predicate, thisArg, defaultValue, this));
}

class LastOperator<T, R> implements Operator<T, R> {
  constructor(private predicate?: (value: T, index: number, source:Observable<T>) => boolean, private thisArg?: any, private defaultValue?: any, private source?: Observable<T>) {
    
  }
  
  call(observer: Subscriber<R>): Subscriber<T> {
    return new LastSubscriber(observer, this.predicate, this.thisArg, this.defaultValue, this.source);
  }
}

class LastSubscriber<T> extends Subscriber<T> {
  private lastValue: T;
  private hasValue: boolean = false;
  private predicate: Function;
  private index: number = 0;
  
  constructor(destination: Observer<T>, predicate?: (value: T, index: number, source: Observable<T>) => boolean, 
    private thisArg?: any, private defaultValue?: any, private source?: Observable<T>) {
    super(destination);
    if(typeof defaultValue !== 'undefined') {
      this.lastValue = defaultValue;
      this.hasValue = true;
    }
    if(typeof predicate === 'function') {
      this.predicate = bindCallback(predicate, thisArg, 3);
    }
  }
  
  _next(value: T) {
    const predicate = this.predicate;
    if(predicate) {
      let result = tryCatch(predicate)(value, this.index++, this.source);
      if(result === errorObject) {
        this.destination.error(result.e);
      } else if (result) {
        this.lastValue = value;
        this.hasValue = true;
      }
    } else {
      this.lastValue = value;
      this.hasValue = true;
    }
  }
  
  _complete() {
    const destination = this.destination;
    if(this.hasValue) {
      destination.next(this.lastValue);
      destination.complete();
    } else {
      destination.error(new EmptyError);
    }
  }
}