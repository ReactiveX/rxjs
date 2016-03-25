import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {Observable} from '../Observable';

/**
 * Returns an Observable that mirrors the source Observable, but will call a specified function when
 * the source terminates on complete or error.
 * @param {function} finallySelector function to be called when source terminates.
 * @return {Observable} an Observable that mirrors the source, but will call the specified function on termination.
 * @method finally
 * @owner Observable
 */
export function _finally<T>(finallySelector: () => void): Observable<T> {
  return this.lift(new FinallyOperator(finallySelector));
}

export interface FinallySignature<T> {
  <T>(finallySelector: () => void): Observable<T>;
}

class FinallyOperator<T> implements Operator<T, T> {
  constructor(private finallySelector: () => void) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new FinallySubscriber(subscriber, this.finallySelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class FinallySubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>, finallySelector: () => void) {
    super(destination);
    this.add(new Subscription(finallySelector));
  }
}
