import Operator from '../../Operator';
import Observer from '../../Observer';
import Observable from '../../Observable';
import Subscriber from '../../Subscriber';

import tryCatch from '../../util/tryCatch';
import {errorObject} from '../../util/errorObject';
import bindCallback from '../../util/bindCallback';

export class FindValueOperator<T, R> implements Operator<T, R> {
  constructor(private predicate: (value: T, index: number, source:Observable<T>) => boolean, private source:Observable<T>,
    private yieldIndex: boolean, private thisArg?: any) {
    
  }
  
  call(observer: Subscriber<T>): Subscriber<T> {
    return new FindValueSubscriber(observer, this.predicate, this.source, this.yieldIndex, this.thisArg);
  }
}

export class FindValueSubscriber<T> extends Subscriber<T> {
  private predicate: Function;
  private index: number = 0;
  
  constructor(destination: Subscriber<T>, predicate: (value: T, index: number, source: Observable<T>) => boolean, 
    private source: Observable<T>, private yieldIndex: boolean, private thisArg?: any) {
    super(destination);
    
    if(typeof predicate === 'function') {
      this.predicate = bindCallback(predicate, thisArg, 3);
    }
  }
  
  private notifyComplete(value: any): void {
    const destination = this.destination;
    
    destination.next(value);
    destination.complete();
  }
  
  _next(value: T) {
    const predicate = this.predicate;
    
    if (predicate === undefined) {
      this.destination.error(new TypeError('predicate must be a function'));
    }
    
    let index = this.index++;
    let result = tryCatch(predicate)(value, index, this.source);
    if(result === errorObject) {
      this.destination.error(result.e);
    } else if (result) {
      this.notifyComplete(this.yieldIndex ? index : value);
    }
  }
  
  _complete() {
    this.notifyComplete(this.yieldIndex ? -1 : undefined);
  }
}