import { ObservableInput, Operation, Sink, FOType, SinkArg } from 'rxjs/internal/types';
import { lift } from 'rxjs/internal/util/lift';
import { Subscription } from 'rxjs/internal/Subscription';
import { Observable } from 'rxjs/internal/Observable';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { fromSource } from 'rxjs/internal/sources/fromSource';

/**
 * Applies an accumulator function over the source Observable where the
 * accumulator function itself returns an Observable, then each intermediate
 * Observable returned is merged into the output Observable.
 *
 * <span class="informal">It's like {@link scan}, but the Observables returned
 * by the accumulator are merged into the outer Observable.</span>
 *
 * ## Example
 * Count the number of click events
 * ```javascript
 * const click$ = fromEvent(document, 'click');
 * const one$ = click$.pipe(mapTo(1));
 * const seed = 0;
 * const count$ = one$.pipe(
 *   mergeScan((acc, one) => of(acc + one), seed),
 * );
 * count$.subscribe(x => console.log(x));
 *
 * // Results:
 * 1
 * 2
 * 3
 * 4
 * // ...and so on for each click
 * ```
 *
 * @param {function(acc: R, value: T): Observable<R>} accumulator
 * The accumulator function called on each source value.
 * @param seed The initial accumulation value.
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of
 * input Observables being subscribed to concurrently.
 * @return {Observable<R>} An observable of the accumulated values.
 * @method mergeScan
 * @owner Observable
 */
export function mergeScan<T, R>(
  accumulator: (acc: R, value: T) => ObservableInput<R>,
  seed: R,
  concurrent: number = Number.POSITIVE_INFINITY
  ): Operation<T, R> {
  return lift((source: Observable<T>, dest: Sink<R>, subs: Subscription) => {
    const buffer: T[] = [];
    let active = 0;
    let acc = seed;
    let hasValue = false;
    let outerComplete = false;

    const _complete = () => {
      if (!hasValue) {
        dest(FOType.NEXT, acc, subs);
      }
      dest(FOType.COMPLETE, undefined, subs);
    };

    const _next = (v: T) => {
      if (active < concurrent) {
        const inner = tryUserFunction(() => fromSource(accumulator(acc, v)));
        if (resultIsError(inner)) {
          dest(FOType.ERROR, inner.error, subs);
          return;
        }

        active++;
        const innerSubs = new Subscription();
        subs.add(innerSubs);

        // inner subscription
        inner(FOType.SUBSCRIBE, (ti: FOType, vi: SinkArg<R>, innerSubs: Subscription) => {
          if (ti === FOType.COMPLETE) {
            active--;
            if (buffer.length > 0) {
              _next(buffer.shift());
            } else if (active === 0 && outerComplete) {
              _complete();
            }
            return;
          }
          if (ti === FOType.NEXT) {
            acc = vi;
            hasValue = true;
          }
          dest(ti, vi, subs);
        }, innerSubs);

      } else {
        buffer.push(v);
      }
    };

    // outer subscription
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      switch (t) {
        case FOType.NEXT:
          _next(v);
          break;
        case FOType.COMPLETE:
          outerComplete = true;
          if (active === 0 && buffer.length === 0) {
            _complete();
          }
          break;
        default:
          dest(t, v, subs);
          break;
      }
    }, subs);
  });
}
