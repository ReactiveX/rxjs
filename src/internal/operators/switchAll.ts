import {OperatorFunction, ObservableInput, MonoTypeOperatorFunction} from '../types';
import { switchMap } from './switchMap';
import { identity } from '../util/identity';

export function switchAll<T>(): OperatorFunction<ObservableInput<T>, T>;
export function switchAll<R>(): OperatorFunction<any, R>;

/**
 * Converts a higher-order Observable into a first-order Observable
 * producing values only from the most recent observable sequence
 *
 * <span class="informal">Flattens an Observable-of-Observables.</span>
 *
 * ![](switchAll.png)
 *
 * `switchAll` subscribes to an Observable that emits Observables, also known as a higher-order Observable.
 * The observable sequence that at any point in time produces the elements of the most recent inner
 * observable sequence that has been received. The output Observable only completes once the source observable,
 * and all inner Observables have completed. Any error delivered by the source or inner Observables will be immediately
 * emitted on the output Observable.
 *
 * ## Examples
 * Spawn a new interval Observable for each click event, but for every new
 * click, it just cancel the previous one then it subscribes to the new one
 * ```ts
 * import { fromEvent, interval } from "rxjs";
 * import { switchAll, map } from "rxjs/operators";
 *
 * const clicks = fromEvent(document, 'click');
 * const higherOrder = clicks.pipe(map((ev) => interval(1000)));
 * const firstOrder = higherOrder.pipe(switchAll());
 * firstOrder.subscribe(x => console.log(x));
 *
 /* Outout
 *  1
 *  2
 *  3
 *  4
 *  ...
 *  (click)
 *  1
 *  2
 *  3
 *  ...
 *  (click)
 *  ...
 * ```
 *
 * Hit on the screen and it will let you track the last 10 mouse position.
 * For every click you are able to track the mouse position.
 * ```ts
 * import { fromEvent } from "rxjs";
 * import { switchAll, map, take } from "rxjs/operators";
 *
 * const mousePosition$ = fromEvent<MouseEvent>(document, "mousemove")
 *   .pipe(
 *     take(10),
 *     map(evt => ({ x: evt.clientX, y: evt.clientY})),
 *   );
 *
 * const clicks$ = fromEvent<MouseEvent>(document, "click")
 *   .pipe(
 *      map(evt => ({ x: evt.clientX, y: evt.clientY})),
 *   );
 *
 * const higherOrder$ = clicks$
 *   .pipe(
 *      map(positions => mousePosition$),
 *    );
 *
 * const firstOrder$ = higherOrder$.pipe(switchAll());
 *
 * firstOrder$.subscribe(
 *   console.log,
 *   null,
 *   () => console.log("I complete ;)"))
 *
 /* Output
 * (click)
 * {x: 187, y: 51}
 * {x: 187, y: 53}
 * ...
 * {x: 127, y: 92}
 * (click)
 * {x: 315, y: 62}
 * {x: 315, y: 63}
 * ...
 * {x: 255, y: 118}
 * (click)
 * ...
 * ```
 *
 * @see {@link combineAll}
 * @see {@link concatAll}
 * @see {@link exhaust}
 * @see {@link switchMap}
 * @see {@link switchMapTo}
 * @see {@link mergeAll}
 */

export function switchAll<T>(): OperatorFunction<ObservableInput<T>, T> {
  return switchMap(identity);
}