import type { Subscriber} from '@rxjs/observable';
import { operate, from, Observable } from '@rxjs/observable';
import type { ObservableInput, OperatorFunction, ObservedValueOf } from '../types.js';

/**
 * Projects each source value to an Observable which is merged in the output
 * Observable only if the previous projected Observable has completed.
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables using {@link exhaustAll}.</span>
 *
 * ![](exhaustMap.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an (so-called "inner") Observable. When it projects a source value to
 * an Observable, the output Observable begins emitting the items emitted by
 * that projected Observable. However, `exhaustMap` ignores every new projected
 * Observable if the previous projected Observable has not yet completed. Once
 * that one completes, it will accept and flatten the next projected Observable
 * and repeat this process.
 *
 * ## Example
 *
 * Run a finite timer for each click, only if there is no currently active timer
 *
 * ```ts
 * import { fromEvent, exhaustMap, interval, take } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   exhaustMap(() => interval(1000).pipe(take(5)))
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link concatMap}
 * @see {@link exhaustAll}
 * @see {@link mergeMap}
 * @see {@link switchMap}
 *
 * @param project A function that, when applied to an item emitted by the source
 * Observable, returns an Observable.
 * @return A function that returns an Observable containing projected
 * Observables of each item of the source, ignoring projected Observables that
 * start before their preceding Observable has completed.
 */
export function exhaustMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O>> {
  return (source) =>
    new Observable((destination) => {
      let index = 0;
      let innerSub: Subscriber<T> | null = null;
      let isComplete = false;
      source.subscribe(
        operate({
          destination,
          next: (outerValue) => {
            if (!innerSub) {
              innerSub = operate({
                destination,
                complete: () => {
                  innerSub = null;
                  isComplete && destination.complete();
                },
              });
              from(project(outerValue, index++)).subscribe(innerSub);
            }
          },
          complete: () => {
            isComplete = true;
            !innerSub && destination.complete();
          },
        })
      );
    });
}
