import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { Observer, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

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
 * @return A function that returns an Observable that emits GroupedObservables,
 * each of which corresponds to a unique key value and each of which emits
 * those items from the source Observable that share that key value.
 */
export function groupBy<T, K, R>(
  keySelector: (value: T) => K,
  elementSelector?: ((value: T) => R) | void,
  durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>,
  subjectSelector?: () => Subject<R>
): OperatorFunction<T, GroupedObservable<K, R>> {
  return operate((source, subscriber) => {
    // A lookup for the groups that we have so far.
    const groups = new Map<K, Subject<any>>();

    // Used for notifying all groups and the subscriber in the same way.
    const notify = (cb: (group: Observer<any>) => void) => {
      groups.forEach(cb);
      cb(subscriber);
    };

    // Used to handle errors from the source, AND errors that occur during the
    // next call from the source.
    const handleError = (err: any) => notify((consumer) => consumer.error(err));

    // Capturing a reference to this, because we need a handle to it
    // in `createGroupedObservable` below. This is what we use to
    // subscribe to our source observable. This sometimes needs to be unsubscribed
    // out-of-band with our `subscriber` which is the downstream subscriber, or destination,
    // in cases where a user unsubscribes from the main resulting subscription, but
    // still has groups from this subscription subscribed and would expect values from it
    // Consider:  `source.pipe(groupBy(fn), take(2))`.
    const groupBySourceSubscriber = new GroupBySubscriber(
      subscriber,
      (value: T) => {
        // Because we have to notify all groups of any errors that occur in here,
        // we have to add our own try/catch to ensure that those errors are propagated.
        // OperatorSubscriber will only send the error to the main subscriber.
        try {
          const key = keySelector(value);

          let group = groups.get(key);
          if (!group) {
            // Create our group subject
            groups.set(key, (group = subjectSelector ? subjectSelector() : new Subject<any>()));

            // Emit the grouped observable. Note that we can't do a simple `asObservable()` here,
            // because the grouped observable has special semantics around reference counting
            // to ensure we don't sever our connection to the source prematurely.
            const grouped = createGroupedObservable(key, group);
            subscriber.next(grouped);

            if (durationSelector) {
              const durationSubscriber = new OperatorSubscriber(
                // Providing the group here ensures that it is disposed of -- via `unsubscribe` --
                // wnen the duration subscription is torn down. That is important, because then
                // if someone holds a handle to the grouped observable and tries to subscribe to it
                // after the connection to the source has been severed, they will get an
                // `ObjectUnsubscribedError` and know they can't possibly get any notifications.
                group as any,
                () => {
                  // Our duration notified! We can complete the group.
                  // The group will be removed from the map in the teardown phase.
                  group!.complete();
                  durationSubscriber?.unsubscribe();
                },
                // Completions are also sent to the group, but just the group.
                undefined,
                // Errors on the duration subscriber are sent to the group
                // but only the group. They are not sent to the main subscription.
                undefined,
                // Teardown: Remove this group from our map.
                () => groups.delete(key)
              );

              // Start our duration notifier.
              groupBySourceSubscriber.add(durationSelector(grouped).subscribe(durationSubscriber));
            }
          }

          // Send the value to our group.
          group.next(elementSelector ? elementSelector(value) : value);
        } catch (err) {
          handleError(err);
        }
      },
      // Source completes.
      () => notify((consumer) => consumer.complete()),
      // Error from the source.
      handleError,
      // Free up memory.
      // When the source subscription is _finally_ torn down, release the subjects and keys
      // in our groups Map, they may be quite large and we don't want to keep them around if we
      // don't have to.
      () => groups.clear()
    );

    // Subscribe to the source
    source.subscribe(groupBySourceSubscriber);

    /**
     * Creates the actual grouped observable returned.
     * @param key The key of the group
     * @param groupSubject The subject that fuels the group
     */
    function createGroupedObservable(key: K, groupSubject: Subject<any>) {
      const result: any = new Observable<T>((groupSubscriber) => {
        groupBySourceSubscriber.activeGroups++;
        const innerSub = groupSubject.subscribe(groupSubscriber);
        return () => {
          innerSub.unsubscribe();
          // We can kill the subscription to our source if we now have no more
          // active groups subscribed, and a teardown was already attempted on
          // the source.
          --groupBySourceSubscriber.activeGroups === 0 &&
            groupBySourceSubscriber.teardownAttempted &&
            groupBySourceSubscriber.unsubscribe();
        };
      });
      result.key = key;
      return result;
    }
  });
}

/**
 * This was created because groupBy is a bit unique, in that emitted groups that have
 * subscriptions have to keep the subscription to the source alive until they
 * are torn down.
 */
class GroupBySubscriber<T> extends OperatorSubscriber<T> {
  /**
   * The number of actively subscribed groups
   */
  activeGroups = 0;
  /**
   * Whether or not teardown was attempted on this subscription.
   */
  teardownAttempted = false;

  unsubscribe() {
    this.teardownAttempted = true;
    // We only kill our subscription to the source if we have
    // no active groups. As stated above, consider this scenario:
    // source$.pipe(groupBy(fn), take(2)).
    this.activeGroups === 0 && super.unsubscribe();
  }
}

/**
 * An observable of values that is the emitted by the result of a {@link groupBy} operator,
 * contains a `key` property for the grouping.
 */
export interface GroupedObservable<K, T> extends Observable<T> {
  /**
   * The key value for the grouped notifications.
   */
  readonly key: K;
}
