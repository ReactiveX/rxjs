import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {PartialObserver} from '../Observer';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function mergeMapTo<T, R, R2>(observable: Observable<R>,
                                     resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2 | number,
                                     concurrent: number = Number.POSITIVE_INFINITY): Observable<R2> {
  return this.lift(new MergeMapToOperator(observable, <any>resultSelector, concurrent));
}

// TODO: Figure out correct signature here: an Operator<Observable<T>, R2>
//       needs to implement call(observer: Subscriber<R2>): Subscriber<Observable<T>>
export class MergeMapToOperator<T, R, R2> implements Operator<Observable<T>, R2> {
  constructor(private ish: Observable<R> | Promise<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2,
              private concurrent: number = Number.POSITIVE_INFINITY) {
  }

  call(observer: Subscriber<R2>): Subscriber<any> {
    return new MergeMapToSubscriber(observer, this.ish, this.resultSelector, this.concurrent);
  }
}

export class MergeMapToSubscriber<T, R, R2> extends OuterSubscriber<T, R> {
  private hasCompleted: boolean = false;
  private buffer: Observable<any>[] = [];
  private active: number = 0;
  protected index: number = 0;

  constructor(destination: Subscriber<R2>,
              private ish: Observable<R> | Promise<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2,
              private concurrent: number = Number.POSITIVE_INFINITY) {
    super(destination);
  }

  protected _next(value: any): void {
    if (this.active < this.concurrent) {
      const resultSelector = this.resultSelector;
      const index = this.index++;
      const ish = this.ish;
      const destination = this.destination;

      this.active++;
      this._innerSub(ish, destination, resultSelector, value, index);
    } else {
      this.buffer.push(value);
    }
  }

  private _innerSub(ish: any,
                    destination: PartialObserver<R>,
                    resultSelector: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2,
                    value: T,
                    index: number): void {
    this.add(subscribeToResult<T, R>(this, ish, value, index));
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    const { resultSelector, destination } = this;
    if (resultSelector) {
      this.trySelectResult(outerValue, innerValue, outerIndex, innerIndex);
    } else {
      destination.next(innerValue);
    }
  }

  private trySelectResult(outerValue: T, innerValue: R,
                          outerIndex: number, innerIndex: number): void {
    const { resultSelector, destination } = this;
    let result: R2;
    try {
      result = resultSelector(outerValue, innerValue, outerIndex, innerIndex);
    } catch (err) {
      destination.error(err);
      return;
    }

    destination.next(result);
  }

  notifyError(err: any): void {
    this.destination.error(err);
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
