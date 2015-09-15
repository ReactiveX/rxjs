import Observable from '../Observable';
import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';
import Observer from '../Observer';
import tryCatch from '../util/tryCatch';
import { errorObject } from '../util/errorObject';

export default function flatMap<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                      resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R,
                                      concurrent: number = Number.POSITIVE_INFINITY) {
  return this.lift(new FlatMapOperator(project, resultSelector, concurrent));
}

export class FlatMapOperator<T, R, R2> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => Observable<R>,
    private resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2,
    private concurrent: number = Number.POSITIVE_INFINITY) {
  }
  
  call(observer: Subscriber<R>): Subscriber<T> {
    return new FlatMapSubscriber(observer, this.project, this.resultSelector, this.concurrent);
  }
}

export class FlatMapSubscriber<T, R, R2> extends Subscriber<T> {
  private hasCompleted: boolean = false;
  private buffer: Observable<any>[] = [];
  private active: number = 0;
  protected index: number = 0;
  
  constructor(destination: Observer<T>, 
    private project: (value: T, index: number) => Observable<R>,
    private resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2,
    private concurrent: number = Number.POSITIVE_INFINITY) {
    super(destination);
  }
  
  _next(value: any) {
    if(this.active < this.concurrent) {
      const resultSelector = this.resultSelector;
      const index = this.index++;
      const observable = tryCatch(this.project)(value, index);
      if(observable === errorObject) {
        this.destination.error(observable.e);
      } else {
        this._innerSubscribe(observable, value, index);
      }
    } else {
      this.buffer.push(value);
    }
  }
  
  _innerSubscribe(observable, value, index) {
    const resultSelector = this.resultSelector;
    if(observable._isScalar) {
      if(resultSelector) {
        let result = tryCatch(resultSelector)(observable.value, value, 0, index);
        if(result === errorObject) {
          this.destination.error(result.e);
        } else {
          this.destination.next(result);
        }
      } else {
        this.destination.next(observable.value);
      }
    } else {
      this.active++;
      this.add(observable.subscribe(new FlatMapInnerSubscriber(this.destination, this, value, index, resultSelector)));
    }
  }
  
  _complete() {
    this.hasCompleted = true;
    if(this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
    }
  }
  
  notifyComplete(innerSub: Subscription<T>) {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if(buffer.length > 0) {
      this._next(buffer.shift());
    } else if (this.active === 0 && this.hasCompleted) {
      this.destination.complete();
    }
  }
}

export class FlatMapInnerSubscriber<T, R, R2> extends Subscriber<R> {
  index: number = 0;
  
  constructor(destination: Observer<R>, private parent: FlatMapSubscriber<any, R, R2>, 
    private outerValue: T,
    private outerIndex: number,
    private resultSelector?: (innerValue: T, outerValue: R, innerIndex: number, outerIndex: number) => R2) {
    super(destination);
  }
  
  _next(value: R) {
    const resultSelector = this.resultSelector;
    const index = this.index++;
    if(resultSelector) {
      let result = tryCatch(resultSelector)(value, this.outerValue, index, this.outerIndex);
      if(result === errorObject) {
        this.destination.error(result.e);
      } else {
        this.destination.next(result);
      }
    } else {
      this.destination.next(value);
    }
  }
  
  _complete() {
    this.parent.notifyComplete(this);
  }
}