import Observable from '../Observable';
import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';
import Observer from '../Observer';
import tryCatch from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import subscribeToResult from '../util/subscribeToResult';
import OuterSubscriber from '../OuterSubscriber';
import InnerSubscriber from '../InnerSubscriber';

export class MergeMapOperator<T, R, R2> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2,
              private concurrent: number = Number.POSITIVE_INFINITY) {
  }

  call(observer: Subscriber<R>): Subscriber<T> {
    return new MergeMapSubscriber(
      observer, this.project, this.resultSelector, this.concurrent
    );
  }
}

export class MergeMapSubscriber<T, R, R2> extends OuterSubscriber<T, R> {
  private hasCompleted: boolean = false;
  private buffer: Observable<any>[] = [];
  private active: number = 0;
  protected index: number = 0;

  constructor(destination: Observer<T>,
              private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2,
              private concurrent: number = Number.POSITIVE_INFINITY) {
    super(destination);
  }

  _next(value: any) {
    if (this.active < this.concurrent) {
      const resultSelector = this.resultSelector;
      const index = this.index++;
      const ish = tryCatch(this.project)(value, index);
      const destination = this.destination;
      if (ish === errorObject) {
        destination.error(ish.e);
      } else {
        this.active++;
        this._innerSub(ish, value, index);
      }
    } else {
      this.buffer.push(value);
    }
  }

  _innerSub(ish: any, value: T, index: number) {
    this.add(subscribeToResult<T, R>(this, ish, value, index));
  }

  _complete() {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) {
    const { destination, resultSelector } = this;
    if (resultSelector) {
      const result = tryCatch(resultSelector)(outerValue, innerValue, outerIndex, innerIndex);
      if (result === errorObject) {
        destination.error(errorObject.e);
      } else {
        destination.next(result);
      }
    } else {
      destination.next(innerValue);
    }
  }

  notifyComplete(innerSub: Subscription<T>) {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if (buffer.length > 0) {
      this._next(buffer.shift());
    } else if (this.active === 0 && this.hasCompleted) {
      this.destination.complete();
    }
  }
}