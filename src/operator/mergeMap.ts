import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {subscribeToResult} from '../util/subscribeToResult';
import {OuterSubscriber} from '../OuterSubscriber';

/**
 * Returns an Observable that emits items based on applying a function that you supply to each item emitted by the
 * source Observable, where that function returns an Observable, and then merging those resulting Observables and
 * emitting the results of this merger.
 *
 * <img src="./img/mergeMap.png" width="100%">
 *
 * @param {Function} a function that, when applied to an item emitted by the source Observable, returns an Observable.
 * @returns {Observable} an Observable that emits the result of applying the transformation function to each item
 * emitted by the source Observable and merging the results of the Observables obtained from this transformation
 */
export function mergeMap<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                   resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2 | number,
                                   concurrent: number = Number.POSITIVE_INFINITY): Observable<R2> {
  return this.lift(new MergeMapOperator(project, <any>resultSelector, concurrent));
}

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
  private buffer: T[] = [];
  private active: number = 0;
  protected index: number = 0;

  constructor(destination: Subscriber<R>,
              private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2,
              private concurrent: number = Number.POSITIVE_INFINITY) {
    super(destination);
  }

  protected _next(value: T): void {
    if (this.active < this.concurrent) {
      const index = this.index++;
      const ish = tryCatch(this.project)(value, index);
      const destination = this.destination;
      if (ish === errorObject) {
        destination.error(errorObject.e);
      } else {
        this.active++;
        this._innerSub(ish, value, index);
      }
    } else {
      this.buffer.push(value);
    }
  }

  private _innerSub(ish: Observable<R>, value: T, index: number): void {
    this.add(subscribeToResult<T, R>(this, ish, value, index));
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
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

  notifyComplete(innerSub: Subscription): void {
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