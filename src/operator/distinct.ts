import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from previous items.
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 * If a comparator function is not provided, an equality check is used by default.
 * As the internal HashSet of this operator grows larger and larger, care should be taken in the domain of inputs this operator may see.
 * An optional paramter is also provided such that an Observable can be provided to queue the internal HashSet to flush the values it holds.
 * @param {function} [compare] optional comparison function called to test if an item is distinct from previous items in the source.
 * @param {Observable} [flushes] optional Observable for flushing the internal HashSet of the operator.
 * @returns {Observable} an Observable that emits items from the source Observable with distinct values.
 */
export function distinct<T>(compare?: (x: T, y: T) => boolean, flushes?: Observable<any>) {
  return this.lift(new DistinctOperator(compare, flushes));
}

class DistinctOperator<T, R> implements Operator<T, R> {
  constructor(private compare: (x: T, y: T) => boolean, private flushes: Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DistinctSubscriber(subscriber, this.compare, this.flushes);
  }
}

class HashSet<T> {
  private set: Array<T> = [];

  constructor(private compare: (x: T, y: T) => boolean) {
  }

  private has(item: T): boolean {
    for (var i = 0; i < this.set.length; i++) {
      if (this.compare(this.set[i], item)) {
        return true;
      }
    }

    return false;
  }

  push(item: T): boolean {
    if (this.has(item)) {
      return false;
    } else {
      this.set.push(item);
      return true;
    }
  }

  flush(): void {
    this.set = [];
  }
}

class DistinctSubscriber<T> extends Subscriber<T> {
  private hashSet: HashSet<T>;
  private flushSubscription: Subscription;

  constructor(destination: Subscriber<T>, compare: (x: T, y: T) => boolean, flushes: Observable<any>) {
    super(destination);
    if (typeof compare === 'function') {
      this.compare = compare;
    }
    this.hashSet = new HashSet(this.compare);

    if (flushes) {
      this.flushSubscription = flushes.subscribe(() => this.hashSet.flush());
    }
  }

  private compare(x: T, y: T): boolean {
    return x === y;
  }

  private disposeFlushSubscription(): void {
    if (this.flushSubscription) {
      this.flushSubscription.unsubscribe();
    }
  }

  protected _next(value: T): void {
    let result: any = false;

    result = tryCatch(this.hashSet.push.bind(this.hashSet))(value);
    if (result === errorObject) {
      this.destination.error(errorObject.e);
      return;
    }

    if (result) {
      this.destination.next(value);
    }
  }

  protected _complete(): void {
    this.disposeFlushSubscription();
    super._complete();
  }

  unsubscribe(): void {
    this.disposeFlushSubscription();
    super.unsubscribe();
  }

}
