import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { EmptyError } from '../util/EmptyError';
import { MonoTypeOperatorFunction } from '../../internal/types';

/**
 * Returns an Observable that emits only the last item emitted by the source Observable.
 * It optionally takes a predicate function as a parameter, in which case, rather than emitting
 * the last item from the source Observable, the resulting Observable will emit the last item
 * from the source Observable that satisfies the predicate.
 *
 * <img src="./img/last.png" width="100%">
 *
 * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`
 * callback if the Observable completes before any `next` notification was sent.
 * @param {function} [predicate] - The condition any source emitted item has to satisfy.
 * @param {any} [defaultValue] - An optional default value to provide if last
 * predicate isn't met or no values were emitted.
 * @return {Observable} An Observable that emits only the last item satisfying the given condition
 * from the source, or an NoSuchElementException if no such items are emitted.
 * @throws - Throws if no items that match the predicate are emitted by the source Observable.
 */
export function last<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean,
                        defaultValue?: T): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(new LastOperator(predicate, defaultValue, source));
}

class LastOperator<T> implements Operator<T, T> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private defaultValue: any,
              private source: Observable<T>) {
  }

  call(observer: Subscriber<T>, source: any): any {
    return source.subscribe(new LastSubscriber(observer, this.predicate, this.defaultValue, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class LastSubscriber<T> extends Subscriber<T> {
  private lastValue: T;
  private hasValue = false;
  private index = 0;

  constructor(destination: Subscriber<T>,
              private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private defaultValue: T,
              private source: Observable<T>) {
    super(destination);
    if (typeof defaultValue !== 'undefined') {
      this.lastValue = defaultValue;
      this.hasValue = true;
    }
  }

  protected _next(value: T): void {
    const index = this.index++;
    if (this.predicate) {
      this._tryPredicate(value, index);
    } else {
      this.lastValue = value;
      this.hasValue = true;
    }
  }

  private _tryPredicate(value: T, index: number) {
    let result: any;
    try {
      result = this.predicate(value, index, this.source);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    if (result) {
      this.lastValue = value;
      this.hasValue = true;
    }
  }

  protected _complete(): void {
    const destination = this.destination;
    if (this.hasValue) {
      destination.next(this.lastValue);
      destination.complete();
    } else {
      destination.error(new EmptyError);
    }
  }
}
