import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

/**
 * @return {Observable< Set<T>>|WebSocketSubject<T>|Observable<T>}
 * @method toSet
 * @owner Observable
 */
export function toSet<T>(): Observable< Set<T>> {
  return this.lift(new ToSetOperator());
}

export interface ToSetSignature<T> {
  (): Observable< Set<T>>;
}

class ToSetOperator<T> implements Operator<T, Set<T>> {
    call(subscriber: Subscriber< Set<T>>, source: any): any {
    return source._subscribe(new ToSetSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ToSetSubscriber<T> extends Subscriber<T> {

  private set: Set<{}> = new Set();

  constructor(destination: Subscriber< Set<T>>) {
    super(destination);
  }

  protected _next(x: T) {
    this.set.add(x);
  }

  protected _complete() {
    this.destination.next(this.set);
    this.destination.complete();
  }
}
