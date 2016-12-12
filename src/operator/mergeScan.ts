import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { subscribeToResult } from '../util/subscribeToResult';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';

/**
 * @param project
 * @param seed
 * @param concurrent
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method mergeScan
 * @owner Observable
 */
export function mergeScan<T, R>(this: Observable<T>, project: (acc: R, value: T) => Observable<R>,
                                seed: R,
                                concurrent: number = Number.POSITIVE_INFINITY): Observable<R> {
  return this.lift(new MergeScanOperator(project, seed, concurrent));
}

export class MergeScanOperator<T, R> implements Operator<T, R> {
  constructor(private project: (acc: R, value: T) => Observable<R>,
              private seed: R,
              private concurrent: number) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new MergeScanSubscriber(
      subscriber, this.project, this.seed, this.concurrent
    ));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class MergeScanSubscriber<T, R> extends OuterSubscriber<T, R> {
  private hasValue: boolean = false;
  private hasCompleted: boolean = false;
  private buffer: Observable<any>[] = [];
  private active: number = 0;
  protected index: number = 0;

  constructor(destination: Subscriber<R>,
              private project: (acc: R, value: T) => Observable<R>,
              private acc: R,
              private concurrent: number) {
    super(destination);
  }

  protected _next(value: any): void {
    if (this.active < this.concurrent) {
      const index = this.index++;
      const ish = tryCatch(this.project)(this.acc, value);
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

  private _innerSub(ish: any, value: T, index: number): void {
    this.add(subscribeToResult<T, R>(this, ish, value, index));
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      if (this.hasValue === false) {
        this.destination.next(this.acc);
      }
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    const { destination } = this;
    this.acc = innerValue;
    this.hasValue = true;
    destination.next(innerValue);
  }

  notifyComplete(innerSub: Subscription): void {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if (buffer.length > 0) {
      this._next(buffer.shift());
    } else if (this.active === 0 && this.hasCompleted) {
      if (this.hasValue === false) {
        this.destination.next(this.acc);
      }
      this.destination.complete();
    }
  }
}
