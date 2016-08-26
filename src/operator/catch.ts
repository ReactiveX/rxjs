import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable, ObservableInput } from '../Observable';

import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * Catches errors on the observable to be handled by returning a new observable or throwing an error.
 * @param {function} selector a function that takes as arguments `err`, which is the error, and `caught`, which
 *  is the source observable, in case you'd like to "retry" that observable by returning it again. Whatever observable
 *  is returned by the `selector` will be used to continue the observable chain.
 * @return {Observable} an observable that originates from either the source or the observable returned by the
 *  catch `selector` function.
 * @method catch
 * @owner Observable
 */
export function _catch<T, R>(selector: (err: any, caught: Observable<T>) => ObservableInput<R>): Observable<R> {
  const operator = new CatchOperator(selector);
  const caught = this.lift(operator);
  return (operator.caught = caught);
}

export interface CatchSignature<T> {
  <R>(selector: (err: any, caught: Observable<T>) => ObservableInput<R>): Observable<R>;
}

class CatchOperator<T, R> implements Operator<T, R> {
  caught: Observable<T>;

  constructor(private selector: (err: any, caught: Observable<T>) => ObservableInput<T | R>) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source._subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class CatchSubscriber<T, R> extends OuterSubscriber<T, R> {
  constructor(destination: Subscriber<any>,
              private selector: (err: any, caught: Observable<T>) => ObservableInput<T | R>,
              private caught: Observable<T>) {
    super(destination);
  }

  // NOTE: overriding `error` instead of `_error` because we don't want
  // to have this flag this subscriber as `isStopped`.
  error(err: any) {
    if (!this.isStopped) {
      let result: any;

      try {
        result = this.selector(err, this.caught);
      } catch (err) {
        this.destination.error(err);
        return;
      }

      this.unsubscribe();
      (<any>this.destination).remove(this);
      subscribeToResult(this, result);
    }
  }
}
