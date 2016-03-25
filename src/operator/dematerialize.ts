import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Notification} from '../Notification';

/**
 * Returns an Observable that transforms Notification objects into the items or notifications they represent.
 *
 * @see {@link Notification}
 *
 * @return {Observable} an Observable that emits items and notifications embedded in Notification objects emitted by the source Observable.
 * @method dematerialize
 * @owner Observable
 */
export function dematerialize<T>(): Observable<any> {
  return this.lift(new DeMaterializeOperator());
}

export interface DematerializeSignature<T> {
  <R>(): Observable<R>;
}

class DeMaterializeOperator<T extends Notification<any>, R> implements Operator<T, R> {
  call(subscriber: Subscriber<any>, source: any): any {
    return source._subscribe(new DeMaterializeSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DeMaterializeSubscriber<T extends Notification<any>> extends Subscriber<T> {
  constructor(destination: Subscriber<any>) {
    super(destination);
  }

  protected _next(value: T) {
    value.observe(this.destination);
  }
}
