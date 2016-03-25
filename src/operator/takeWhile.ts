import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

/**
 * @param predicate
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method takeWhile
 * @owner Observable
 */
export function takeWhile<T>(predicate: (value: T, index: number) => boolean): Observable<T> {
  return this.lift(new TakeWhileOperator(predicate));
}

export interface TakeWhileSignature<T> {
  (predicate: (value: T, index: number) => boolean): Observable<T>;
}

class TakeWhileOperator<T> implements Operator<T, T> {
  constructor(private predicate: (value: T, index: number) => boolean) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new TakeWhileSubscriber(subscriber, this.predicate));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TakeWhileSubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: (value: T, index: number) => boolean) {
    super(destination);
  }

  protected _next(value: T): void {
    const destination = this.destination;
    let result: boolean;
    try {
      result = this.predicate(value, this.index++);
    } catch (err) {
      destination.error(err);
      return;
    }
    this.nextOrComplete(value, result);
  }

  private nextOrComplete(value: T, predicateResult: boolean): void {
    const destination = this.destination;
    if (Boolean(predicateResult)) {
      destination.next(value);
    } else {
      destination.complete();
    }
  }
}
