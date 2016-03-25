import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {ArgumentOutOfRangeError} from '../util/ArgumentOutOfRangeError';
import {EmptyObservable} from '../observable/EmptyObservable';
import {Observable} from '../Observable';

/**
 * @throws {ArgumentOutOfRangeError} When using `takeLast(i)`, it delivers an
 * ArgumentOutOrRangeError to the Observer's `error` callback if `i < 0`.
 * @param total
 * @return {any}
 * @method takeLast
 * @owner Observable
 */
export function takeLast<T>(total: number): Observable<T> {
  if (total === 0) {
    return new EmptyObservable<T>();
  } else {
    return this.lift(new TakeLastOperator(total));
  }
}

export interface TakeLastSignature<T> {
  (total: number): Observable<T>;
}

class TakeLastOperator<T> implements Operator<T, T> {
  constructor(private total: number) {
    if (this.total < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new TakeLastSubscriber(subscriber, this.total));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TakeLastSubscriber<T> extends Subscriber<T> {
  private ring: Array<T> = new Array();
  private count: number = 0;

  constructor(destination: Subscriber<T>, private total: number) {
    super(destination);
  }

  protected _next(value: T): void {
    const ring = this.ring;
    const total = this.total;
    const count = this.count++;

    if (ring.length < total) {
      ring.push(value);
    } else {
      const index = count % total;
      ring[index] = value;
    }
  }

  protected _complete(): void {
    const destination = this.destination;
    let count = this.count;

    if (count > 0) {
      const total = this.count >= this.total ? this.total : this.count;
      const ring  = this.ring;

      for (let i = 0; i < total; i++) {
        const idx = (count++) % total;
        destination.next(ring[idx]);
      }
    }

    destination.complete();
  }
}
