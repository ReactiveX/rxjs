/** @prettier */
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { OperatorFunction, Observer } from '../types';
import { lift } from '../util/lift';

export function groupBy<T, K extends T>(
  keySelector: (value: T) => value is K
): OperatorFunction<T, GroupedObservable<true, K> | GroupedObservable<false, Exclude<T, K>>>;
export function groupBy<T, K>(keySelector: (value: T) => K): OperatorFunction<T, GroupedObservable<K, T>>;
export function groupBy<T, K>(
  keySelector: (value: T) => K,
  elementSelector: void,
  durationSelector: (grouped: GroupedObservable<K, T>) => Observable<any>
): OperatorFunction<T, GroupedObservable<K, T>>;
export function groupBy<T, K, R>(
  keySelector: (value: T) => K,
  elementSelector?: (value: T) => R,
  durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>
): OperatorFunction<T, GroupedObservable<K, R>>;
export function groupBy<T, K, R>(
  keySelector: (value: T) => K,
  elementSelector?: (value: T) => R,
  durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>,
  subjectSelector?: () => Subject<R>
): OperatorFunction<T, GroupedObservable<K, R>>;

/**
 * Groups the items emitted by an Observable according to a specified criterion,
 * and emits these grouped items as `GroupedObservables`, one
 * {@link GroupedObservable} per group.
 *
 * ![](groupBy.png)
 *
 * When the Observable emits an item, a key is computed for this item with the keySelector function.
 *
 * If a {@link GroupedObservable} for this key exists, this {@link GroupedObservable} emits. Otherwise, a new
 * {@link GroupedObservable} for this key is created and emits.
 *
 * A {@link GroupedObservable} represents values belonging to the same group represented by a common key. The common
 * key is available as the `key` field of a {@link GroupedObservable} instance.
 *
 * The elements emitted by {@link GroupedObservable}s are by default the items emitted by the Observable, or elements
 * returned by the elementSelector function.
 *
 * ## Examples
 *
 * ### Group objects by id and return as array
 *
 * ```ts
 * import { of } from 'rxjs';
 * import { mergeMap, groupBy, reduce } from 'rxjs/operators';
 *
 * of(
 *   {id: 1, name: 'JavaScript'},
 *   {id: 2, name: 'Parcel'},
 *   {id: 2, name: 'webpack'},
 *   {id: 1, name: 'TypeScript'},
 *   {id: 3, name: 'TSLint'}
 * ).pipe(
 *   groupBy(p => p.id),
 *   mergeMap((group$) => group$.pipe(reduce((acc, cur) => [...acc, cur], [])))
 * )
 * .subscribe(p => console.log(p));
 *
 * // displays:
 * // [ { id: 1, name: 'JavaScript'},
 * //   { id: 1, name: 'TypeScript'} ]
 * //
 * // [ { id: 2, name: 'Parcel'},
 * //   { id: 2, name: 'webpack'} ]
 * //
 * // [ { id: 3, name: 'TSLint'} ]
 * ```
 *
 * ### Pivot data on the id field
 *
 * ```ts
 * import { of } from 'rxjs';
 * import { groupBy, map, mergeMap, reduce } from 'rxjs/operators';
 *
 * of(
 *   { id: 1, name: 'JavaScript' },
 *   { id: 2, name: 'Parcel' },
 *   { id: 2, name: 'webpack' },
 *   { id: 1, name: 'TypeScript' },
 *   { id: 3, name: 'TSLint' }
 * )
 *   .pipe(
 *     groupBy(p => p.id, p => p.name),
 *     mergeMap(group$ =>
 *       group$.pipe(reduce((acc, cur) => [...acc, cur], [`${group$.key}`]))
 *     ),
 *     map(arr => ({ id: parseInt(arr[0], 10), values: arr.slice(1) }))
 *  )
 *  .subscribe(p => console.log(p));
 *
 * // displays:
 * // { id: 1, values: [ 'JavaScript', 'TypeScript' ] }
 * // { id: 2, values: [ 'Parcel', 'webpack' ] }
 * // { id: 3, values: [ 'TSLint' ] }
 * ```
 *
 * @param {function(value: T): K} keySelector A function that extracts the key
 * for each item.
 * @param {function(value: T): R} [elementSelector] A function that extracts the
 * return element for each item.
 * @param {function(grouped: GroupedObservable<K,R>): Observable<any>} [durationSelector]
 * A function that returns an Observable to determine how long each group should
 * exist.
 * @param {function(): Subject<R>} [subjectSelector] Factory function to create an
 * intermediate Subject through which grouped elements are emitted.
 * @return {Observable<GroupedObservable<K,R>>} An Observable that emits
 * GroupedObservables, each of which corresponds to a unique key value and each
 * of which emits those items from the source Observable that share that key
 * value.
 * @name groupBy
 */
export function groupBy<T, K, R>(
  keySelector: (value: T) => K,
  elementSelector?: ((value: T) => R) | void,
  durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>,
  subjectSelector?: () => Subject<R>
): OperatorFunction<T, GroupedObservable<K, R>> {
  return (source: Observable<T>) =>
    lift(source, function (this: Subscriber<GroupedObservable<K, R>>, source: Observable<T>) {
      const subscriber = this;
      const groups = new Map<K, Subject<any>>();
      let groupBySubscriber: GroupBySubscriber<any>;

      function createGroupedObservable<K, T>(key: K, groupSubject: Subject<any>) {
        const result: any = new Observable<T>((goSubscriber) => {
          groupBySubscriber.count++;
          const innerSub = groupSubject.subscribe(goSubscriber);
          return () => {
            innerSub.unsubscribe();
            if (--groupBySubscriber.count === 0 && groupBySubscriber.unsubAttempted) {
              groupBySubscriber.unsubscribe();
            }
          };
        });
        result.key = key;
        return result;
      }

      groupBySubscriber = new GroupBySubscriber(
        subscriber,
        (value: T) => {
          const key = keySelector(value);
          const element = elementSelector ? elementSelector(value) : value;

          let group = groups.get(key);
          if (!group) {
            group = subjectSelector ? subjectSelector() : new Subject<any>();
            groups.set(key, group);
            const grouped = createGroupedObservable(key, group);
            subscriber.next(grouped);
            if (durationSelector) {
              const duration = durationSelector(grouped);
              const durationSubscriber = new GroupDurationSubscriber(
                group,
                () => {
                  group!.complete();
                  durationSubscriber?.unsubscribe();
                },
                () => groups.delete(key)
              );
              groupBySubscriber.add(duration.subscribe(durationSubscriber));
            }
          }

          group.next(element!);
        },
        (err) => {
          groups.forEach((group) => group.error(err));
          subscriber.error(err);
        },
        () => {
          groups.forEach((group) => group.complete());
          subscriber.complete();
        }
      );

      return source.subscribe(groupBySubscriber);
    });
}

export interface RefCountSubscription {
  count: number;
  unsubscribe: () => void;
  closed: boolean;
  attemptedToUnsubscribe: boolean;
}

class GroupBySubscriber<T> extends Subscriber<T> {
  count = 0;
  unsubAttempted = false;

  constructor(
    destination: Subscriber<any>,
    protected onNext: (value: T) => void,
    protected _error: (err: any) => void,
    protected _complete: () => void
  ) {
    super(destination);
  }

  // TODO: Unify this pattern elsewhere to reduce try-catching.
  protected _next(value: T) {
    try {
      this.onNext(value);
    } catch (err) {
      this._error(err);
    }
  }

  unsubscribe() {
    this.unsubAttempted = true;
    if (this.count === 0) {
      super.unsubscribe();
    }
  }
}

class GroupDurationSubscriber<T> extends Subscriber<T> {
  constructor(destination: Observer<T>, protected _next: (value: T) => void, private onUnsubscribe: () => void) {
    super(destination);
  }

  unsubscribe() {
    if (!this.closed) {
      this.isStopped = true;
      this.onUnsubscribe();
      super.unsubscribe();
    }
  }
}

export interface GroupedObservable<K, T> extends Observable<T> {
  readonly key: K;
}
