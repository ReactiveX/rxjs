import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';

/**
 * Returns an Observable that applies a specified accumulator function to the first item emitted by a source Observable,
 * then feeds the result of that function along with the second item emitted by the source Observable into the same
 * function, and so on until all items have been emitted by the source Observable, and emits the final result from
 * the final call to your function as its sole item.
 * This technique, which is called "reduce" here, is sometimes called "aggregate," "fold," "accumulate," "compress," or
 * "inject" in other programming contexts.
 *
 * <img src="./img/reduce.png" width="100%">
 *
 * @param {initialValue} the initial (seed) accumulator value
 * @param {accumulator} an accumulator function to be invoked on each item emitted by the source Observable, the
 * result of which will be used in the next accumulator call.
 * @return {Observable} an Observable that emits a single item that is the result of accumulating the output from the
 * items emitted by the source Observable.
 * @method reduce
 * @owner Observable
 */
export function reduce<T, R>(project: (acc: R, value: T) => R, seed?: R): Observable<R> {
  return this.lift(new ReduceOperator(project, seed));
}

export interface ReduceSignature<T> {
  <R>(project: (acc: R, value: T) => R, seed?: R): Observable<R>;
}

export class ReduceOperator<T, R> implements Operator<T, R> {

  constructor(private project: (acc: R, value: T) => R, private seed?: R) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source._subscribe(new ReduceSubscriber(subscriber, this.project, this.seed));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class ReduceSubscriber<T, R> extends Subscriber<T> {

  acc: T | R;
  hasSeed: boolean;
  hasValue: boolean = false;
  project: (acc: R, value: T) => R;

  constructor(destination: Subscriber<R>, project: (acc: R, value: T) => R, seed?: R) {
    super(destination);
    this.acc = seed;
    this.project = project;
    this.hasSeed = typeof seed !== 'undefined';
  }

  protected _next(value: T) {
    if (this.hasValue || (this.hasValue = this.hasSeed)) {
      this._tryReduce(value);
    } else {
      this.acc = value;
      this.hasValue = true;
    }
  }

  private _tryReduce(value: T) {
    let result: any;
    try {
      result = this.project(<R>this.acc, value);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.acc = result;
  }

  protected _complete() {
    if (this.hasValue || this.hasSeed) {
      this.destination.next(this.acc);
    }
    this.destination.complete();
  }
}
