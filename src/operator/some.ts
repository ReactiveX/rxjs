import { Operator } from '../Operator';
import { Observer } from '../Observer';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';

/**
 * Returns an Observable that emits whether or not any items of the source satisfies the condition specified.
 * @param {function} predicate a function for determining if an item meets a specified condition.
 * @param {any} [thisArg] optional object to use for `this` in the callback
 * @return {Observable} an Observable of booleans that determines if all items of the source Observable meet the condition specified.
 * @method some
 * @owner Observable
 */
/* tslint:disable:max-line-length */
export function some<T>(this: Observable<T>, predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<boolean> {
  return this.lift(new SomeOperator(predicate, thisArg, this));
}
/* tslint:enable:max-line-length */

class SomeOperator<T> implements Operator<T, boolean> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private source?: Observable<T>) {
  }

  call(observer: Subscriber<boolean>, source: any): any {
    return source._subscribe(new SomeSubscriber(observer, this.predicate, this.thisArg, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SomeSubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Observer<boolean>,
              private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg: any,
              private source?: Observable<T>) {
    super(destination);
    this.thisArg = thisArg || this;
  }

  private notifyComplete(someValueMatch: boolean): void {
    this.destination.next(someValueMatch);
    this.destination.complete();
  }

  protected _next(value: T): void {
    let result = false;
    try {
      result = this.predicate.call(this.thisArg, value, this.index++, this.source);
    } catch (err) {
      this.destination.error(err);
      return;
    }

    if (result) {
      this.notifyComplete(true);
    }
  }

  protected _complete(): void {
    this.notifyComplete(false);
  }
}
