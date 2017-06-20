import { root } from '../util/root';
import { IScheduler } from '../Scheduler';
import { Observable, ArrayOrIterable } from '../Observable';
import { iterator as Symbol_iterator } from '../symbol/iterator';
import { TeardownLogic } from '../Subscription';
import { Subscriber } from '../Subscriber';
import { isArrayLike } from '../util/isArrayLike';

interface IteratorObservableState<T> {
  subscriber: Subscriber<T>;
  iterator: Iterator<T>;
  index: number;
  hasError?: boolean;
  error?: any;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class IteratorObservable<T> extends Observable<T> {
  private iterator: Iterator<T>;

  static create<T>(iterator: ArrayOrIterable<T> | string, scheduler?: IScheduler): IteratorObservable<T> {
    return new IteratorObservable<T>(iterator, scheduler);
  }

  private static dispatch<T>(state: IteratorObservableState<T>) {

    const { index, hasError, iterator, subscriber } = state;

    if (hasError) {
      subscriber.error(state.error);
      return;
    }

    let result = iterator.next();
    if (result.done) {
      subscriber.complete();
      return;
    }

    subscriber.next(result.value);
    state.index = index + 1;

    if (subscriber.closed) {
      if (typeof iterator.return === 'function') {
        iterator.return();
      }
      return;
    }

    (<any>this).schedule(state);
  }

  constructor(iterator: ArrayOrIterable<T> | string, private scheduler?: IScheduler) {
    super();

    if (iterator == null) {
      throw new Error('iterator cannot be null.');
    }

    this.iterator = getIterator(iterator);
  }

  protected _subscribe(subscriber: Subscriber<T>): TeardownLogic {

    let index = 0;
    const { iterator, scheduler } = this;

    if (scheduler) {
      return scheduler.schedule(IteratorObservable.dispatch, 0, {
        index, iterator, subscriber
      });
    } else {
      do {
        let result = iterator.next();
        if (result.done) {
          subscriber.complete();
          break;
        } else {
          subscriber.next(result.value);
        }
        if (subscriber.closed) {
          if (typeof iterator.return === 'function') {
            iterator.return();
          }
          break;
        }
      } while (true);
    }
  }
}

class StringIterator implements Iterator<string> {
  constructor(private str: string,
              private idx: number = 0,
              private len: number = str.length) {
  }
  [Symbol_iterator]() { return (this); }
  next() {
    return this.idx < this.len ? {
      done: false,
      value: this.str.charAt(this.idx++)
    } : {
        done: true,
        value: undefined
      };
  }
}

class ArrayIterator<T> implements Iterator<T> {
  constructor(private arr: T[],
              private idx: number = 0,
              private len: number = toLength(arr)) {
  }
  [Symbol_iterator]() { return this; }
  next() {
    return this.idx < this.len ? {
      done: false,
      value: this.arr[this.idx++]
    } : {
        done: true,
        value: undefined
      };
  }
}

function getIterator<T>(obj: ArrayOrIterable<T> | string): Iterator<T> {
  const i = obj[Symbol_iterator];
  if (!i) {
    if (typeof obj === 'string') {
      return <any>new StringIterator(obj);
    }
    if (isArrayLike(obj)) {
      return new ArrayIterator<T>(<any>obj);
    }
    throw new TypeError('object is not iterable');
  }
  return obj[Symbol_iterator]();
}

const maxSafeInteger = Math.pow(2, 53) - 1;

function toLength(o: any) {
  let len = +o.length;
  if (isNaN(len)) {
    return 0;
  }
  if (len === 0 || !numberIsFinite(len)) {
    return len;
  }
  len = sign(len) * Math.floor(Math.abs(len));
  if (len <= 0) {
    return 0;
  }
  if (len > maxSafeInteger) {
    return maxSafeInteger;
  }
  return len;
}

function numberIsFinite(value: any) {
  return typeof value === 'number' && root.isFinite(value);
}

function sign(value: any) {
  let valueAsNumber = +value;
  if (valueAsNumber === 0) {
    return valueAsNumber;
  }
  if (isNaN(valueAsNumber)) {
    return valueAsNumber;
  }
  return valueAsNumber < 0 ? -1 : 1;
}
