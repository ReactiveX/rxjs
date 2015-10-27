import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import tryCatch from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import OuterSubscriber from '../OuterSubscriber';
import subscribeToResult from '../util/subscribeToResult';
import InnerSubscriber from '../InnerSubscriber';

export class MergeMapToOperator<T, R, R2> implements Operator<T, R> {
  constructor(private ish: any,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2,
              private concurrent: number = Number.POSITIVE_INFINITY) {
    }

  call(observer: Subscriber<R>): Subscriber<T> {
    return new MergeMapToSubscriber(observer, this.ish, this.resultSelector, this.concurrent);
  }
}

export class MergeMapToSubscriber<T, R, R2> extends OuterSubscriber<T, R> {
  private hasCompleted: boolean = false;
  private buffer: Observable<any>[] = [];
  private active: number = 0;
  protected index: number = 0;

  constructor(destination: Subscriber<R>,
              private ish: any,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2,
              private concurrent: number = Number.POSITIVE_INFINITY) {
    super(destination);
  }

  _next(value: any): void {
    if (this.active < this.concurrent) {
      const resultSelector = this.resultSelector;
      const index = this.index++;
      const ish = this.ish;
      const destination = this.destination;
      if (ish === errorObject) {
        destination.error(ish.e);
      } else {
        this.active++;
        this._innerSub(ish, destination, resultSelector, value, index);
      }
    } else {
      this.buffer.push(value);
    }
  }

  _innerSub(ish: any,
            destination: Observer<R>,
            resultSelector: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2,
            value: T,
            index: number): void {
    this.add(subscribeToResult<T, R>(this, ish, value, index));
  }

  _complete(): void {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    const { resultSelector, destination } = this;
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

  notifyError(err: any): void {
    this.destination.error(err);
  }

  notifyComplete(innerSub: InnerSubscriber<T, R>): void {
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