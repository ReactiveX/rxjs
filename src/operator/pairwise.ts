import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

/**
 * Groups pairs of consecutive emissions together and emits them as an array of
 * two values.
 *
 * <span class="informal">Puts the current value and previous value together as
 * an array, and emits that.</span>
 *
 * <img src="./img/pairwise.png" width="100%">
 *
 * The Nth emission from the source Observable will cause the output Observable
 * to emit an array [(N-1)th, Nth] of the previous and the current value, as a
 * pair. For this reason, `pairwise` emits on the second and subsequent
 * emissions from the source Observable, but not on the first emission, because
 * there is no previous value in that case.
 *
 * @example <caption>On every click (starting from the second), emit the relative distance to the previous click</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var pairs = clicks.pairwise();
 * var distance = pairs.map(pair => {
 *   var x0 = pair[0].clientX;
 *   var y0 = pair[0].clientY;
 *   var x1 = pair[1].clientX;
 *   var y1 = pair[1].clientY;
 *   return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
 * });
 * distance.subscribe(x => console.log(x));
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 *
 * @return {Observable<[T, T]>} An Observable of pairs of consecutive values
 * from the source Observable.
 * @method pairwise
 * @owner Observable
 */
export function pairwise<T>(): Observable<[T, T]> {
  return this.lift(new PairwiseOperator());
}

export interface PairwiseSignature<T> {
  (): Observable<[T, T]>;
}

class PairwiseOperator<T> implements Operator<T, [T, T]> {
  call(subscriber: Subscriber<[T, T]>, source: any): any {
    return source._subscribe(new PairwiseSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class PairwiseSubscriber<T> extends Subscriber<T> {
  private prev: T;
  private hasPrev: boolean = false;

  constructor(destination: Subscriber<[T, T]>) {
    super(destination);
  }

  _next(value: T): void {
    if (this.hasPrev) {
      this.destination.next([this.prev, value]);
    } else {
      this.hasPrev = true;
    }

    this.prev = value;
  }
}
