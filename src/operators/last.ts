import Observable from '../Observable';
import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observer from '../Observer';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';
import EmptyError from '../util/EmptyError';

export default function last<T, R>(predicate?: (value: T, index: number, source:Observable<T>) => boolean, resultSelector?: (value: T, index: number) => R, thisArg?: any, defaultValue?: any) : Observable<R> {
  return this.lift(new LastOperator(predicate, resultSelector, thisArg, defaultValue, this));
}

class LastOperator<T, R> implements Operator<T, R> {
  constructor(private predicate?: (value: T, index: number, source:Observable<T>) => boolean, 
              private resultSelector?: (value: T, index: number) => R,
              private thisArg?: any, private defaultValue?: any, private source?: Observable<T>) {
    
  }
  
  call(observer: Subscriber<R>): Subscriber<T> {
    return new LastSubscriber(observer, this.predicate, this.resultSelector, this.thisArg, this.defaultValue, this.source);
  }
}

class LastSubscriber<T, R> extends Subscriber<T> {
  private lastValue: T;
  private hasValue: boolean = false;
  private predicate: Function;
  private index: number = 0;
  
  constructor(destination: Observer<T>, predicate?: (value: T, index: number, source: Observable<T>) => boolean, 
    private resultSelector?: (value: T, index: number) => R,
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
  
  _next(value: any) {
    const { predicate, resultSelector, destination } = this;
    const index = this.index++;
    
    if(predicate) {
      let found = tryCatch(predicate)(value, index, this.source);
      if(found === errorObject) {
        destination.error(errorObject.e);
        return;
      }
    
      if(found) {
        if(resultSelector) {
          value = tryCatch(resultSelector)(value, index);
          if(value === errorObject) {
            destination.error(errorObject.e);
            return;
          }
        }
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