import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';
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
export function _catch<T>(selector: (err: any, caught: Observable<any>) => Observable<any>): Observable<T> {
  let catchOperator = new CatchOperator(selector);
  let caught = this.lift(catchOperator);
  catchOperator.caught = caught;
  return caught;
}

class CatchOperator<T, R> implements Operator<T, R> {
  caught: Observable<any>;

  constructor(private selector: (err: any, caught: Observable<any>) => Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new CatchSubscriber(subscriber, this.selector, this.caught);
  }
}

class CatchSubscriber<T> extends Subscriber<T> {
  private lastSubscription: Subscription<T>;

  constructor(public destination: Subscriber<T>,
              private selector: (err: any, caught: Observable<any>) => Observable<any>,
              private caught: Observable<any>) {
    super(null);
    this.lastSubscription = this;
    this.destination.add(this);
  }

  _next(value: T) {
    this.destination.next(value);
  }

  _error(err) {
    const result = tryCatch(this.selector)(err, this.caught);
    if (result === errorObject) {
      this.destination.error(errorObject.e);
    } else {
      this.lastSubscription.unsubscribe();
      this.lastSubscription = result.subscribe(this.destination);
    }
  }

  _complete() {
    this.lastSubscription.unsubscribe();
    this.destination.complete();
  }

  _unsubscribe() {
    this.lastSubscription.unsubscribe();
  }
}
