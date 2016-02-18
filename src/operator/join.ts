import { Observable } from '../Observable';
import { ArrayObservable } from '../observable/ArrayObservable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
import { take } from './take';

/**
 * Returns an Observable that combines the items emitted by two Observables, and selects which items to combine
 * based on duration-windows that you define on a per-item basis via the durtionSelector functions. You implement
 * these windows as Observables whose lifespans begin with each item emitted by either Observable. When such a
 * window-defining Observable either emits an item or completes, the window for the item it is associated with
 * closes. So long as an item's window is open, it will combine with any item emitted by the other Observable.
 * `resultSelector` is the function you define to combine the items.
 *
 * @param {Observable} right  the right observable sequence to join elements for
 * @param {Function} leftDurationSelector  a function to select the duration (expressed as an observable sequence)
 * of each element of the left observable sequence, used to determine overlap
 * @param {Function} rightDurationSelector  a function to select the duration (expressed as an observable sequence)
 * of each element of the left observable sequence, used to determine overlap
 * @param {Function} resultSelector  a function invoked to compute a result element for any two overlapping elements
 * of the left and right observable sequences.
 * @returns {Observable} an observable sequence that contains result elements computed from source elements that
 * have an overlapping duration
 */
export function join<T1, T2, R>(this: Observable<T1>,
                                right: Observable<T2>,
                                leftDurationSelector: (value: T1) => Observable<any>,
                                rightDurationSelector: (value: T2) => Observable<any>,
                                resultSelector: (left: T1, right: T2) => R): Observable<R> {
  const o = new ArrayObservable([this, right]);
  return o.lift(new JoinOperator(leftDurationSelector, rightDurationSelector, resultSelector));
}

class JoinOperator<T1, T2, R> implements Operator<any, R> {
  constructor(private leftDurationSelector: (value: T1) => Observable<any>,
              private rightDurationSelector: (value: T2) => Observable<any>,
              private resultSelector: (left: T1, right: T2) => R) {
  }

  call(subscriber: Subscriber<R>, source: any): TeardownLogic {
    return source.subscribe(new JoinSubscriber(subscriber, this.leftDurationSelector, this.rightDurationSelector, this.resultSelector));
  }
}

class Context<T> {
  public map: Map<number, T> = new Map<number, T>();
  public done: boolean = false;

  constructor(public idCounter: number, public source: Observable<T>) {
  }

  get empty(): boolean {
    return this.map.size === 0;
  }

  add(value: T): number {
    const id = this.idCounter;
    this.idCounter += 2;
    this.map.set(id, value);
    return id;
  }

  remove(id: number): void {
    this.map.delete(id);
  }
}

class JoinSubscriber<T1, T2, R> extends OuterSubscriber<any, R> {
  private left: Context<T1>;
  private right: Context<T2>;

  constructor(destination: Subscriber<R>,
              private leftDurationSelector: (value: T1) => Observable<any>,
              private rightDurationSelector: (value: T2) => Observable<any>,
              private resultSelector: (left: T1, right: T2) => R) {
    super(destination);
  }

  protected _next(value: Observable<T1 | T2>): void {
    if (this.left) {
      this.right = new Context<T2>(3, <Observable<T2>>value);
    } else {
      this.left = new Context<T1>(2, <Observable<T1>>value);
    }
  }

  protected _complete(): void {
    this.add(subscribeToResult(this, this.left.source, null, 0));
    this.add(subscribeToResult(this, this.right.source, null, 1));
  }

  notifyNext(outerValue: any, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<any, R>): void {
    if (outerIndex === 0) {
      this.leftNext(innerValue);
    } else if (outerIndex === 1) {
      this.rightNext(innerValue);
    }
  }

  private leftNext(value: T1): void {
    const id = this.left.add(value);
    const success = this.tryDurationSelector(this.leftDurationSelector, value, id);
    if (success) {
      this.right.map.forEach((v: T2) => {
        this.tryResultSelector(value, v);
      });
    }
  }

  private rightNext(value: T2): void {
    const id = this.right.add(value);
    const success = this.tryDurationSelector(this.rightDurationSelector, value, id);
    if (success) {
      this.left.map.forEach((v: T1) => {
        this.tryResultSelector(v, value);
      });
    }
  }

  private tryDurationSelector(durationSelector: (value: T1 | T2) => Observable<any>,
                              value: T1 | T2, id: number): boolean {
    let duration: Observable<any>;
    try {
      duration = durationSelector(value);
    } catch (err) {
      this.destination.error(err);
      return false;
    }
    this.subscribeToDuration(duration, id);
    return true;
  }

  private subscribeToDuration(duration: Observable<any>, id: number): void {
    const durationObservable = take.call(duration, 1);
    this.add(subscribeToResult(this, durationObservable, null, id));
  }

  private tryResultSelector(leftValue: T1, rightValue: T2): void {
    const destination = this.destination;
    let result: R;
    try {
      result = this.resultSelector(leftValue, rightValue);
    } catch (err) {
      destination.error(err);
      return;
    }
    destination.next(result);
  }

  notifyComplete(innerSub: InnerSubscriber<any, R>): void {
    const id = innerSub.outerIndex;
    this.remove(innerSub);
    if (id === 0) {
      this.mainComplete(this.left, this.right);
    } else if (id === 1) {
      this.mainComplete(this.right, this.left);
    } else {
      const context = id % 2 === 0 ? this.left : this.right;
      this.durationComplete(id, context);
    }
  }

  private mainComplete(x: Context<T1 | T2>, y: Context<T1 | T2>): void {
    x.done = true;
    if (y.done || x.empty) {
      this.destination.complete();
    }
  }

  private durationComplete(id: number, context: Context<T1 | T2>): void {
    context.remove(id);
    if (context.done && context.empty) {
      this.destination.complete();
    }
  }
}
