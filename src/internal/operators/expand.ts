import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
import { OperatorFunction, ObservableInput } from '../types';

/**
 * Emit all values from source, then map them to new observables, which are subscribed to,
 * and treated just like values from the source (emitting them, them mapping them to new observables,
 * subscribing, etc), recursively.
 *
 * <span class="informal">Used to process recursive patterns in RxJS.</span>
 *
 * ![](expand.png)
 *
 * What the process looks like:
 *
 * 1. Let `V` = each new value from the source observable
 * 2. Emit `V`.
 * 3. Map `V` to a new observable with the `project` function.
 * 4. Subscribe to the new observable.
 * 5. Let `V` = each new value from the new observable.
 * 6. Goto 2.
 *
 * Effectively, for every new value from the source observable you'll immediately see
 * that in the output from the resulting observable. Immediately after, it will be
 * mapped to a new observable, which is subscribed to. When that new observable emits
 * a value, it goes through the same process as the values from the source. They're
 * emitted, mapped to new observables (and the process repeats itself).
 *
 * This is a useful pattern when you have to deal with things like backpressure.
 * Frequently, developers will use a `Subject` that "subscribes to itself", `expand`
 * eliminates the need for that.
 *
 * ## Example
 *
 * Recursively load 100 paginated values from GitHub API.
 *
 * ```ts
 * import { of, EMPTY } from "rxjs";
 * import { ajax } from "rxjs/ajax";
 * import { map, expand, take, concatMap } from "rxjs/operators";
 *
 * const source = of({ nextPage: 1, page: 0, items: [] }).pipe(
 *   expand(({ nextPage }) => {
 *     if (nextPage === -1) {
 *       // Use something to signal we want to stop recursion,
 *       // in this case, a `nextPage` of -1
 *       return EMPTY;
 *     }
 *     return ajax
 *       .getJSON<{ incomplete_results: boolean; items: any[] }>(
 *         `https://api.github.com/search/code?q=rxjs+user:reactivex&page=${nextPage}`
 *       )
 *       .pipe(
 *         map(data => {
 *           return {
 *             page: nextPage,
 *             // If the results are incomplete, return the next page number.
 *             // Otherwise, return -1, which will stop the
 *             // recursion (above).
 *             nextPage: data.incomplete_results ? nextPage + 1 : -1,
 *             items: data.items
 *           };
 *         })
 *       );
 *   }),
 *   concatMap(({ items }) => items),
 *   take(100),
 * )
 * .subscribe(x => console.log(x));
 * ```
 *
 * ## Example
 *
 * Crawl an async tree.
 *
 * ```ts
 * import { of, EMPTY, isObservable } from "rxjs";
 * import { expand, filter } from "rxjs/operators";
 *
 * // As async tree to crawl.
 * // (Could be any shape, really, this is just an example)
 * const asyncTree = of({
 *   a: of({
 *     c: of({
 *       d: of("peas")
 *     })
 *   }),
 *   b: of({
 *     a: of({
 *       x: of({
 *         y: of("and")
 *       })
 *     })
 *   }),
 *   z: of("carrots")
 * });
 *
 * const source = asyncTree.pipe(
 *   expand(node => {
 *     if (isObservable(node)) {
 *       // We have an observable from a property,
 *       // Get the value out of it and reenter.
 *       return node;
 *     } else if (node && typeof node === "object") {
 *       // A map of properties, convert them into an
 *       // array, which is observable. Reenter with each value
 *       return Object.keys(node).map(key => node[key]);
 *     } else {
 *       // Leaf node
 *       return EMPTY;
 *     }
 *   }),
 *   // We only really need the values out of this.
 *   filter(
 *     value => typeof value === 'string'
 *   )
 * );
 *
 * source.subscribe(x => console.log(x));
 *
 * // Expected output:
 * // "peas"
 * // "and"
 * // "carrots"
 * ```
 *
 *
 *
 * @see {@link mergeMap}
 * @see {@link mergeScan}
 *
 * @param project A function applied to each value from the source observable, projecting
 * that value to an observable inner source. That inner source will be subscribed to, and its
 * values will be sent back into this function.
 * @param concurrent Maximum number of projected observables to subscribe to at the same time
 * @return An observable that takes the values from the source observable and emits them,
 * then also projects them into new, inner observables which are subscribed to, and projected,
 * recursively, with the same function.
 */
export function expand<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent: number = Infinity
): OperatorFunction<T, R> {
  concurrent = (concurrent || 0) < 1 ? Infinity : concurrent;

  return (source: Observable<T>) => source.lift(function expandOperator(this: Subscriber<R>, source: Observable<T>) {
    return source.subscribe(new ExpandSubscriber(this, project, concurrent));
  });
}

class ExpandSubscriber<T, R> extends OuterSubscriber<T, R> {
  private index: number = 0;
  private active: number = 0;
  private hasCompleted: boolean = false;
  private buffer: T[] | undefined;

  constructor(
    protected destination: Subscriber<R>,
    private project: (value: T, index: number) => ObservableInput<R>,
    private concurrent: number
  ) {
    super(destination);
    if (concurrent < Infinity) {
      this.buffer = [];
    }
  }

  protected _next(value: any): void {
    const destination = this.destination;

    if (destination.closed) {
      this._complete();
      return;
    }

    const index = this.index++;
    if (this.active < this.concurrent) {
      destination.next(value);
      try {
        const { project } = this;
        const result = project(value, index);
        this.active++;
        destination.add(subscribeToResult<T, R>(this, result, value, index));
      } catch (err) {
        destination.error(err);
      }
    } else {
      this.buffer!.push(value);
    }
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
    this.unsubscribe();
  }

  notifyNext(_outerValue: T, innerValue: R): void {
    this._next(innerValue);
  }

  notifyComplete(innerSub: Subscription): void {
    const buffer = this.buffer;
    const destination = this.destination as Subscription;
    destination.remove(innerSub);
    this.active--;
    if (buffer && buffer.length > 0) {
      this._next(buffer.shift());
    }
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }
}
