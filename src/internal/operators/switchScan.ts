import { Observable } from '../Observable';
import { ObservableInput, OperatorFunction, MonoTypeOperatorFunction } from '../types';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { of } from '../observable/of';
import { switchMap } from './switchMap';
import { tap } from './tap';

export function switchScan<T>(accumulator: (acc: T, value: T, index: number) => ObservableInput<T>, seed?: T): MonoTypeOperatorFunction<T>;
export function switchScan<T, R>(accumulator: (acc: R, value: T, index: number) => ObservableInput<R>, seed?: R): OperatorFunction<T, R>;

/**
 * Applies an accumulator function over the source Observable where the
 * accumulator function itself returns an Observable, emitting values
 * only from the most recently returned Observable.
 *
 * <span class="informal">It's like {@link scan}, but only to most recent
 * Observable returned by the accumulator is merged into the outer Observable.</span>
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
export function switchScan<T, R>(
  accumulator: (acc: R, value: T, index: number) => ObservableInput<R>,
  seed?: R
): OperatorFunction<T, R> {
  let hasSeed = false;
  // The same reason as described in `scan` https://github.com/ReactiveX/rxjs/blob/master/src/internal/operators/scan.ts#L54-L58
  if (arguments.length >= 2) {
    hasSeed = true;
  }

  return (source: Observable<T>) => source.lift(new SwitchScanOperator(accumulator, seed, hasSeed));
}

class SwitchScanOperator<T, R> implements Operator<T, R> {
  constructor(private accumulator: (acc: R, value: T, index: number) => ObservableInput<R>, private seed: R, private hasSeed: boolean = false) { }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.pipe(
      switchMap((value: T, index: number): ObservableInput<R> => {
        if (this.hasSeed) {
          return this.accumulator(this.seed, value, index);
        } else {
          return of(value);
        }
      }),
      tap((value: R) => {
        this.seed = value;
        this.hasSeed = true;
      }),
    ).subscribe(subscriber);
  }
}
