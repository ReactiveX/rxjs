import {Operator} from '../Operator';
import {Observer} from '../Observer';
import {IObservable} from '../Observable';
import {ISubscriber, Subscriber} from '../Subscriber';

/**
 * Returns an Observable that emits whether or not every item of the source satisfies the condition specified.
 * @param {function} predicate a function for determining if an item meets a specified condition.
 * @param {any} [thisArg] optional object to use for `this` in the callback
 * @return {Observable} an Observable of booleans that determines if all items of the source Observable meet the condition specified.
 * @method every
 * @owner Observable
 */
export function every<T>(predicate: (value: T, index: number, source: IObservable<T>) => boolean,
                         thisArg?: any): IObservable<boolean> {
  return this.lift(new EveryOperator(predicate, thisArg, this));
}

export interface EverySignature<T> {
  (predicate: (value: T, index: number, source: IObservable<T>) => boolean, thisArg?: any): IObservable<boolean>;
}

class EveryOperator<T> implements Operator<T, boolean> {
  constructor(private predicate: (value: T, index: number, source: IObservable<T>) => boolean,
              private thisArg?: any,
              private source?: IObservable<T>) {
  }

  call(observer: ISubscriber<boolean>, source: any): any {
    return source._subscribe(new EverySubscriber(observer, this.predicate, this.thisArg, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class EverySubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Observer<boolean>,
              private predicate: (value: T, index: number, source: IObservable<T>) => boolean,
              private thisArg: any,
              private source?: IObservable<T>) {
    super(destination);
    this.thisArg = thisArg || this;
  }

  private notifyComplete(everyValueMatch: boolean): void {
    this.destination.next(everyValueMatch);
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

    if (!result) {
      this.notifyComplete(false);
    }
  }

  protected _complete(): void {
    this.notifyComplete(true);
  }
}
