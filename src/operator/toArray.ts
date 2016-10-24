import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

/**
 * @return {Observable<any[]>|WebSocketSubject<T>|Observable<T>}
 * @method toArray
 * @owner Observable
 */
export function toArray<T>(this: Observable<T>): Observable<T[]> {
  return this.lift(new ToArrayOperator());
}

class ToArrayOperator<T> implements Operator<T, T[]> {
  call(subscriber: Subscriber<T[]>, source: any): any {
    return source._subscribe(new ToArraySubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ToArraySubscriber<T> extends Subscriber<T> {

  private array: T[] = [];

  constructor(destination: Subscriber<T[]>) {
    super(destination);
  }

  protected _next(x: T) {
    this.array.push(x);
  }

  protected _complete() {
    this.destination.next(this.array);
    this.destination.complete();
  }
}
