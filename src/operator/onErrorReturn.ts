import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { OuterSubscriber } from '../OuterSubscriber';

/**
 * Instructs an Observable to emit a particular item when it encounters an error, and then terminate normally.
 * 
 * You can use this to prevent errors from propagating or to supply fallback data should errors be encountered.
 * @param {function} selector a function that takes as arguments `err`, which is the error. Whatever value
 *  is returned by the `selector` will be emitted as the next value, just before terminating.
 * @return {Observable} an observable that originates from the source
 * @method onErrorReturn
 * @owner Observable
 */
export function onErrorReturn<T, R>(selector: (err: any) => R): Observable<R> {
  const operator = new OnErrorReturnOperator<T, R>(selector);
  return this.lift(operator);
}

export interface OnErrorReturnSignature<T> {
  <R>(selector: (err: any) => R): Observable<R>;
}

class OnErrorReturnOperator<T, R> implements Operator<T, R> {
  constructor(private selector: (err: any) => R) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source._subscribe(new OnErrorReturnSubscriber(subscriber, this.selector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class OnErrorReturnSubscriber<T, R> extends OuterSubscriber<T, R> {
  constructor(destination: Subscriber<any>,
              private selector: (err: any) => R) {
    super(destination);
  }

  // NOTE: overriding `error` instead of `_error` because we don't want
  // to have this flag this subscriber as `isStopped`.
  error(err: any) {
    if (!this.isStopped) {
      const { destination } = this;
      let result: R;

      try {
        result = this.selector(err);
      } catch (err) {
        this.destination.error(err);
        return;
      }

      this.unsubscribe();
      (<any>destination).remove(this);

      destination.next(result);
      destination.complete();
    }
  }
}
