import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

/**
 * Catches errors on the observable to be handled by returning a new observable or throwing an error.
 * @param {function} selector a function that takes as arguments `err`, which is the error, and `caught`, which
 *  is the source observable, in case you'd like to "retry" that observable by returning it again. Whatever observable
 *  is returned by the `selector` will be used to continue the observable chain.
 * @return {Observable} an observable that originates from either the source or the observable returned by the
 *  catch `selector` function.
 */
export default function _catch<T>(selector: (err: any, caught: Observable<any>) => Observable<any>) {
  let catchOperator = new CatchOperator(selector);
  let caught = this.lift(catchOperator);
  catchOperator.caught = caught;
  return caught;
}

class CatchOperator<T, R> implements Operator<T, R> {
  selector: (err: any, caught: Observable<any>) => Observable<any>;
  caught: Observable<any>;
  source: Observable<T>;

  constructor(selector: (err: any, caught: Observable<any>) => Observable<any>) {
    this.selector = selector;
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new CatchSubscriber(subscriber, this.selector, this.caught);
  }
}

class CatchSubscriber<T> extends Subscriber<T> {
  selector: (err: any, caught: Observable<any>) => Observable<any>;
  caught: Observable<any>;

  constructor(destination: Subscriber<T>,
              selector: (err: any, caught: Observable<any>) => Observable<any>,
              caught: Observable<any>) {
    super(destination);
    this.selector = selector;
    this.caught = caught;
  }

  _error(err) {
    const result = tryCatch(this.selector)(err, this.caught);
    if (result === errorObject) {
      this.destination.error(errorObject.e);
    } else {
      this.add(result.subscribe(this.destination));
    }
  }
}
