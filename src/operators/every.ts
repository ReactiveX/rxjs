import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T>{
  return this.lift(new EveryOperator(predicate, thisArg, this));
}

class EveryOperator<T, R> implements Operator<T, R> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean, 
    private thisArg?: any, private source?: Observable<T>) {
    
  }
  
  call(observer: Subscriber<R>): Subscriber<T> {
    return new EverySubscriber(observer, this.predicate, this.thisArg, this.source);
  }
}

class EverySubscriber<T> extends Subscriber<T> {
  private predicate: Function = undefined;
  private index: number = 0;
  
  constructor(destination: Observer<T>, predicate?: (value: T, index: number, source: Observable<T>) => boolean, 
    private thisArg?: any, private source?: Observable<T>) {
    super(destination);
    
    if(typeof predicate === 'function') {
      this.predicate = bindCallback(predicate, thisArg, 3);
    }
  }
  
  private notifyComplete(everyValueMatch: boolean): void {
    this.destination.next(everyValueMatch);
    this.destination.complete();
  }
  
  _next(value: T) {
    const predicate = this.predicate;
    
    if (predicate === undefined) {
      this.destination.error(new TypeError('predicate must be a function'));
    }
    
    let result = tryCatch(predicate)(value, this.index++, this.source);
    if (result === errorObject) {
      this.destination.error(result.e);
    } else if (!result) {
      this.notifyComplete(false);
    }
  }
  
  _complete() {
    this.notifyComplete(true);
  }
}