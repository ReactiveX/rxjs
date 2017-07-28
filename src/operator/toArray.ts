import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

/**
 * Collects all source emissions and emits them as an array when the source completes.
 *
 * <span class="informal">Get all values inside an array when the source completes</span>
 *
 * <img src="./img/toArray.png" width="100%">
 *
 * `toArray` will wait until the source Observable completes
 * before emitting the array containing all emissions.
 * When the source Observable errors no array will be emitted.
 *
 * @example <caption>Create array from input</caption>
 * const input = Rx.Observable.interval(100).take(4);
 *
 * input.toArray()
 *   .subscribe(arr => console.log(arr)); // [0,1,2,3]
 *
 * @see {@link buffer}
 *
 * @return {Observable<any[]>|WebSocketSubject<T>|Observable<T>}
 * @method toArray
 * @owner Observable
 */
export function toArray<T>(this: Observable<T>): Observable<T[]> {
  return this.lift(new ToArrayOperator());
}

class ToArrayOperator<T> implements Operator<T, T[]> {
  call(subscriber: Subscriber<T[]>, source: any): any {
    return source.subscribe(new ToArraySubscriber(subscriber));
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
