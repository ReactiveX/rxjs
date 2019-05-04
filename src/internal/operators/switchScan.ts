import { Observable } from '../Observable';
import { ObservableInput, ObservedValueOf, OperatorFunction } from '../types';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { switchMap } from './switchMap';
import { tap } from './tap';

/**
 * Applies an accumulator function over the source Observable where the
 * accumulator function itself returns an Observable, emitting values
 * only from the most recently returned Observable.
 *
 * <span class="informal">It's like {@link scan}, but only the most recent
 * Observable returned by the accumulator is merged into the outer Observable.</span>
 *
 * ![](switchScan.png)
 *
 * @see {@link scan}
 * @see {@link mergeScan}
 *
 * @param {function(acc: R, value: T, index: number): Observable<R>} accumulator
 * The accumulator function called on each source value.
 * @param {T|R} [seed] The initial accumulation value.
 * @return {Observable<R>} An observable of the accumulated values.
 * @method switchScan
 * @owner Observable
 */
export function switchScan<T, R, O extends ObservableInput<any>>(
  accumulator: (acc: R, value: T, index: number) => O,
  seed: R
): OperatorFunction<T, ObservedValueOf<O>> {
  return (source: Observable<T>) => source.lift(new SwitchScanOperator(accumulator, seed));
}

class SwitchScanOperator<T, R, O extends ObservableInput<any>> implements Operator<T, O> {
  constructor(private accumulator: (acc: R, value: T, index: number) => ObservableInput<O>, private seed: R) { }

  call(subscriber: Subscriber<O>, source: any): any {
    let seed: R = this.seed;

    return source.pipe(
      switchMap((value: T, index: number) => this.accumulator(seed, value, index)),
      tap((value: R) => seed = value),
    ).subscribe(subscriber);
  }
}
