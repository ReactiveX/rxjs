import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

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
export function _catch<T, R>(selector: (err: any, caught: Observable<T>) => Observable<R>): Observable<R> {
  const operator = new CatchOperator(selector);
  const caught = this.lift(operator);
  return (operator.caught = caught);
}

export interface CatchSignature<T> {
  <R>(selector: (err: any, caught: Observable<T>) => Observable<R>): Observable<R>;
}

class CatchOperator<T, R> implements Operator<T, R> {
  caught: Observable<any>;

  constructor(private selector: (err: any, caught: Observable<any>) => Observable<any>) {
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
class CatchSubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<any>,
              private selector: (err: any, caught: Observable<any>) => Observable<any>,
              private caught: Observable<any>) {
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

      this._innerSub(result);
    }
  }

  private _innerSub(result: Observable<any>) {
    this.unsubscribe();
    (<any>this.destination).remove(this);
    result.subscribe(this.destination);
  }
}
