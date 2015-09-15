import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import { FlatMapSubscriber } from './flatMap-support';

export class FlatMapToOperator<T, R, R2> implements Operator<T,R> {
  constructor(private observable: Observable<R>,
    private resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2,
    private concurrent: number = Number.POSITIVE_INFINITY) {
      
    }
  
  call(observer: Subscriber<R>): Subscriber<T> {
    return new FlatMapToSubscriber(observer, this.observable, this.resultSelector, this.concurrent);
  }
}

export class FlatMapToSubscriber<T, R, R2> extends FlatMapSubscriber<T, R, R2> {
  constructor(destination: Observer<T>, private observable: Observable<R>,
    resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2,
    concurrent: number = Number.POSITIVE_INFINITY) {
      super(destination, null, resultSelector, concurrent);
    }
  
  _next(value: T) {
    const observable = this.observable;
    const index = this.index++;
    super._innerSubscribe(observable, value, index);
  }
}