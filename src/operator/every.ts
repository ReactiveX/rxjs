import {Operator} from '../Operator';
import {Observer} from '../Observer';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

/**
 * Returns an Observable that emits whether or not every item of the source satisfies the condition specified.
 * @param {function} predicate a function for determining if an item meets a specified condition.
 * @param {any} [thisArg] optional object to use for `this` in the callback
 * @returns {Observable} an Observable of booleans that determines if all items of the source Observable meet the condition specified.
 */
export function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean,
                         thisArg?: any): Observable<boolean> {
  const source = this;
  return source.lift(new EveryOperator(predicate, thisArg, source));
}

class EveryOperator<T, R> implements Operator<T, boolean> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private source?: Observable<T>) {
  }

  call(observer: Subscriber<boolean>): Subscriber<T> {
    return new EverySubscriber(observer, this.predicate, this.thisArg, this.source);
  }
}

class EverySubscriber<T, R> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Observer<R>,
              private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg: any,
              private source?: Observable<T>) {
    super(destination);
  }

  private notifyComplete(everyValueMatch: boolean): void {
    this.destination.next(everyValueMatch);
    this.destination.complete();
  }

  protected _next(value: T): void {
    const result = tryCatch(this.predicate).call(this.thisArg || this, value, this.index++, this.source);

    if (result === errorObject) {
      this.destination.error(result.e);
    } else if (!result) {
      this.notifyComplete(false);
    }
  }

  protected _complete(): void {
    this.notifyComplete(true);
  }
}
