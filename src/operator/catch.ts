import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

/**
 * Catches errors on the observable to be handled by returning a new observable or throwing an error.
 * @param {function} selector a function that takes as arguments `err`, which is the error, and `caught`, which
 *  is the source observable, in case you'd like to "retry" that observable by returning it again. Whatever observable
 *  is returned by the `selector` will be used to continue the observable chain.
 * @return {Observable} an observable that originates from either the source or the observable returned by the
 *  catch `selector` function.
 */
export function _catch<T, R>(selector: (err: any, caught: Observable<T>) => Observable<R>): Observable<R> {
  const operator = new CatchOperator(selector);
  const caught = this.lift(operator);
  return (operator.caught = caught);
}

class CatchOperator<T, R> implements Operator<T, R> {
  caught: Observable<any>;

  constructor(private selector: (err: any, caught: Observable<any>) => Observable<any>) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new CatchSubscriber(subscriber, this.selector, this.caught);
  }
}

class CatchSubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<any>,
              private selector: (err: any, caught: Observable<any>) => Observable<any>,
              private caught: Observable<any>) {
    super(destination);
  }

  error(err: any) {
    if (!this.isStopped) {
      const result = tryCatch(this.selector)(err, this.caught);
      if (result === errorObject) {
        super.error(errorObject.e);
      } else {
        const { destination } = this;
        this.unsubscribe();
        (<any> destination).remove(this);
        result.subscribe(this.destination);
      }
    }
  }
}
