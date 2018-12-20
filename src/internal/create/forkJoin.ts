import { ObservableInput } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { EMPTY } from 'rxjs/internal/EMPTY';
import { from } from './from';

/* tslint:disable:max-line-length */
// forkJoin([a$, b$, c$]);
export function forkJoin<T>(sources: [ObservableInput<T>]): Observable<T[]>;
export function forkJoin<T, T2>(sources: [ObservableInput<T>, ObservableInput<T2>]): Observable<[T, T2]>;
export function forkJoin<T, T2, T3>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>]): Observable<[T, T2, T3]>;
export function forkJoin<T, T2, T3, T4>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>]): Observable<[T, T2, T3, T4]>;
export function forkJoin<T, T2, T3, T4, T5>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>, ObservableInput<T5>]): Observable<[T, T2, T3, T4, T5]>;
export function forkJoin<T, T2, T3, T4, T5, T6>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>, ObservableInput<T5>, ObservableInput<T6>]): Observable<[T, T2, T3, T4, T5, T6]>;
export function forkJoin<T>(sources: Array<ObservableInput<T>>): Observable<T[]>;

// forkJoin(a$, b$, c$)
export function forkJoin<T>(v1: ObservableInput<T>): Observable<T[]>;
export function forkJoin<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>): Observable<[T, T2]>;
export function forkJoin<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
export function forkJoin<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
export function forkJoin<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
export function forkJoin<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;

export function forkJoin<T>(...sources: ObservableInput<T>[]): Observable<T[]>;
/* tslint:enable:max-line-length */

/**
 * Joins last values emitted by passed Observables.
 *
 * <span class="informal">Wait for Observables to complete and then combine last values they emitted.</span>
 *
 * ![](forkJoin.png)
 *
 * `forkJoin` is an operator that takes any number of Observables which can be passed either as an array
 * or directly as arguments. If no input Observables are provided, resulting stream will complete
 * immediately.
 *
 * `forkJoin` will wait for all passed Observables to complete and then it will emit an array with last
 * values from corresponding Observables. So if you pass `n` Observables to the operator, resulting
 * array will have `n` values, where first value is the last thing emitted by the first Observable,
 * second value is the last thing emitted by the second Observable and so on. That means `forkJoin` will
 * not emit more than once and it will complete after that. If you need to emit combined values not only
 * at the end of lifecycle of passed Observables, but also throughout it, try out {@link combineLatest}
 * or {@link zip} instead.
 *
 * In order for resulting array to have the same length as the number of input Observables, whenever any of
 * that Observables completes without emitting any value, `forkJoin` will complete at that moment as well
 * and it will not emit anything either, even if it already has some last values from other Observables.
 * Conversely, if there is an Observable that never completes, `forkJoin` will never complete as well,
 * unless at any point some other Observable completes without emitting value, which brings us back to
 * the previous case. Overall, in order for `forkJoin` to emit a value, all Observables passed as arguments
 * have to emit something at least once and complete.
 *
 * If any input Observable errors at some point, `forkJoin` will error as well and all other Observables
 * will be immediately unsubscribed.
 *
 * Optionally `forkJoin` accepts project function, that will be called with values which normally
 * would land in emitted array. Whatever is returned by project function, will appear in output
 * Observable instead. This means that default project can be thought of as a function that takes
 * all its arguments and puts them into an array. Note that project function will be called only
 * when output Observable is supposed to emit a result.
 *
 * ## Examples
 * ### Use forkJoin with operator emitting immediately
 * ```javascript
 * import { forkJoin, of } from 'rxjs';
 *
 * const observable = forkJoin(
 *   of(1, 2, 3, 4),
 *   of(5, 6, 7, 8),
 * );
 * observable.subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('This is how it ends!'),
 * );
 *
 * // Logs:
 * // [4, 8]
 * // "This is how it ends!"
 * ```
 *
 * ### Use forkJoin with operator emitting after some time
 * ```javascript
 * import { forkJoin, interval } from 'rxjs';
 * import { take } from 'rxjs/operators';
 *
 * const observable = forkJoin(
 *   interval(1000).pipe(take(3)), // emit 0, 1, 2 every second and complete
 *   interval(500).pipe(take(4)),  // emit 0, 1, 2, 3 every half a second and complete
 * );
 * observable.subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('This is how it ends!'),
 * );
 *
 * // Logs:
 * // [2, 3] after 3 seconds
 * // "This is how it ends!" immediately after
 * ```
 *
 * ### Use forkJoin with project function
 * ```javascript
 * import { forkJoin, interval } from 'rxjs';
 * import { take } from 'rxjs/operators';
 *
 * const observable = forkJoin(
 *   interval(1000).pipe(take(3)), // emit 0, 1, 2 every second and complete
 *   interval(500).pipe(take(4)),  // emit 0, 1, 2, 3 every half a second and complete
 * ).pipe(
 *   map(([n, m]) => n + m),
 * );
 * observable.subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('This is how it ends!'),
 * );
 *
 * // Logs:
 * // 5 after 3 seconds
 * // "This is how it ends!" immediately after
 * ```
 *
 * @see {@link combineLatest}
 * @see {@link zip}
 *
 * @param {...ObservableInput} sources Any number of Observables provided either as an array or as an arguments
 * passed directly to the operator.
 * @return {Observable} Observable emitting either an array of last values emitted by passed Observables
 * or value from project function.
 */
export function forkJoin<T>(
  ...sources: Array<ObservableInput<T> | ObservableInput<T>[]>
): Observable<T[]> {
  if (sources.length === 0) {
    return EMPTY;
  }

  if (sources.length === 1 && Array.isArray(sources[0])) {
    return forkJoin(...(sources[0] as ObservableInput<T>[]));
  }

  return new Observable<T[]>(subscriber => {
    const state = sources.map(toEmptyState);
    const subscription = new Subscription();
    for (let i = 0; i < sources.length && !subscriber.closed; i++) {
      const source = from(sources[i] as ObservableInput<T>);
      subscription.add(source.subscribe({
        next(value: T) {
          const s = state[i];
          s.hasValue = true;
          s.value = value;
        },
        error(err) { subscriber.error(err); },
        complete() {
          const s = state[i];
          s.completed = true;
          if (!s.hasValue || state.every(isComplete)) {
            if (state.every(hasValue)) {
              subscriber.next(state.map(getValue) as T[]);
            }
            subscriber.complete();
          }
        }
      }));
    }
    return subscription;
  });
}

function toEmptyState<T>() {
  return {
    hasValue: false,
    completed: false,
    value: undefined as T
  };
}

function isComplete(s: { completed: boolean }) {
  return s.completed;
}
function hasValue(s: { hasValue: boolean }) {
  return s.hasValue;
}

function getValue<T>(o: { value: T } ): T {
  return o.value;
}
