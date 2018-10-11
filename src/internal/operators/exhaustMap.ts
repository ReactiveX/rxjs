import { Operation, ObservableInput, Sink, FOType, SinkArg } from 'rxjs/internal/types';
import { lift } from 'rxjs/internal/util/lift';
import { Subscription } from 'rxjs/internal/Subscription';
import { Observable } from 'rxjs/internal/Observable';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { fromSource } from 'rxjs/internal/sources/fromSource';

/**
 * Projects each source value to an Observable which is merged in the output
 * Observable only if the previous projected Observable has completed.
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables using {@link exhaust}.</span>
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
 * Run a finite timer for each click, only if there is no currently active timer
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   exhaustMap((ev) => interval(1000).pipe(take(5))),
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link concatMap}
 * @see {@link exhaust}
 * @see {@link mergeMap}
 * @see {@link switchMap}
 *
 * @param {function(value: T, ?index: number): ObservableInput} project A function
 * that, when applied to an item emitted by the source Observable, returns an
 * Observable.
 * @return {Observable} An Observable containing projected Observables
 * of each item of the source, ignoring projected Observables that start before
 * their preceding Observable has completed.
 * @method exhaustMap
 * @owner Observable
 */
export function exhaustMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrency = 1,
): Operation<T, R> {
  return lift((source: Observable<T>, dest: Sink<R>, subs: Subscription) => {
    let index = 0;
    let active = 0;
    let outerComplete = false;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const result = tryUserFunction(() => fromSource(project(v, index++)));
        if (resultIsError(result)) {
          dest(FOType.ERROR, result.error, subs);
        } else {
          if (active < concurrency) {
            active++;
            const innerSubs = new Subscription();
            subs.add(innerSubs);
            result(FOType.SUBSCRIBE, (ti: FOType, vi: SinkArg<R>, innerSubs: Subscription) => {
              if (ti === FOType.COMPLETE) {
                active--;
                if (active === 0 && outerComplete) {
                  dest(ti, undefined, subs);
                }
              } else {
                dest(ti, vi, subs);
              }
            }, innerSubs);
          }
        }
      } else {
        if (t === FOType.COMPLETE) {
          outerComplete = true;
          if (active > 0) {
            return;
          }
        }
        dest(t, v, subs);
      }
    }, subs);
  });
};
