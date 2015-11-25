import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export class ExpandOperator<T, R> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => Observable<any>,
              private concurrent: number = Number.POSITIVE_INFINITY) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new ExpandSubscriber(subscriber, this.project, this.concurrent);
  }
}

export class ExpandSubscriber<T, R> extends OuterSubscriber<T, R> {
  private index: number = 0;
  private active: number = 0;
  private hasCompleted: boolean = false;
  private buffer: any[];

  constructor(destination: Subscriber<R>,
              private project: (value: T, index: number) => Observable<R>,
              private concurrent: number = Number.POSITIVE_INFINITY) {
    super(destination);
    if (concurrent < Number.POSITIVE_INFINITY) {
      this.buffer = [];
    }
  }

  _next(value: any): void {
    const destination = this.destination;

    if (destination.isUnsubscribed) {
      this._complete();
      return;
    }

    const index = this.index++;
    if (this.active < this.concurrent) {
      destination.next(value);
      let result = tryCatch(this.project)(value, index);
      if (result === errorObject) {
        destination.error(result.e);
      } else {
        if (result._isScalar) {
          this._next(result.value);
        } else {
          this.active++;
          this.add(subscribeToResult<T, R>(this, result, value, index));
        }
      }
    } else {
      this.buffer.push(value);
    }
  }

  _complete(): void {
    this.hasCompleted = true;
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }

  notifyComplete(innerSub?: InnerSubscriber<T, R>): void {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if (buffer && buffer.length > 0) {
      this._next(buffer.shift());
    }
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this._next(innerValue);
  }
}
