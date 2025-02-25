import { Observable, from, operate } from '@rxjs/observable';
import { Subject } from '../Subject.js';
import type { ObservableInput, Observer, OperatorFunction, SubjectLike } from '../types.js';

export interface BasicGroupByOptions<K, T> {
  element?: undefined;
  duration?: (grouped: GroupedObservable<K, T>) => ObservableInput<any>;
  connector?: () => SubjectLike<T>;
}

export interface GroupByOptionsWithElement<K, E, T> {
  element: (value: T) => E;
  duration?: (grouped: GroupedObservable<K, E>) => ObservableInput<any>;
  connector?: () => SubjectLike<E>;
}

export function groupBy<T, K>(key: (value: T) => K, options: BasicGroupByOptions<K, T>): OperatorFunction<T, GroupedObservable<K, T>>;

export function groupBy<T, K, E>(
  key: (value: T) => K,
  options: GroupByOptionsWithElement<K, E, T>
): OperatorFunction<T, GroupedObservable<K, E>>;

export function groupBy<T, K extends T>(
  key: (value: T) => value is K
): OperatorFunction<T, GroupedObservable<true, K> | GroupedObservable<false, Exclude<T, K>>>;

export function groupBy<T, K>(key: (value: T) => K): OperatorFunction<T, GroupedObservable<K, T>>;

/**
 * @deprecated use the options parameter instead.
 */
export function groupBy<T, K>(
  key: (value: T) => K,
  element: void,
  duration: (grouped: GroupedObservable<K, T>) => Observable<any>
): OperatorFunction<T, GroupedObservable<K, T>>;

/**
 * @deprecated use the options parameter instead.
 */
export function groupBy<T, K, R>(
  key: (value: T) => K,
  element?: (value: T) => R,
  duration?: (grouped: GroupedObservable<K, R>) => Observable<any>
): OperatorFunction<T, GroupedObservable<K, R>>;

/**
 * Groups the items emitted by an Observable according to a specified criterion,
 * and emits these grouped items as `GroupedObservables`, one
 * {@link GroupedObservable} per group.
 *
 * ![](groupBy.png)
 *
 * When the Observable emits an item, a key is computed for this item with the key function.
 *
 * If a {@link GroupedObservable} for this key exists, this {@link GroupedObservable} emits. Otherwise, a new
 * {@link GroupedObservable} for this key is created and emits.
 *
 * A {@link GroupedObservable} represents values belonging to the same group represented by a common key. The common
 * key is available as the `key` field of a {@link GroupedObservable} instance.
 *
 * The elements emitted by {@link GroupedObservable}s are by default the items emitted by the Observable, or elements
 * returned by the element function.
 *
 * ## Examples
 *
 * Group objects by `id` and return as array
 *
 * ```ts
 * import { of, groupBy, mergeMap, reduce } from 'rxjs';
 *
 * of(
 *   { id: 1, name: 'JavaScript' },
 *   { id: 2, name: 'Parcel' },
 *   { id: 2, name: 'webpack' },
 *   { id: 1, name: 'TypeScript' },
 *   { id: 3, name: 'TSLint' }
 * ).pipe(
 *   groupBy(p => p.id),
 *   mergeMap(group$ => group$.pipe(reduce((acc, cur) => [...acc, cur], [])))
 * )
 * .subscribe(p => console.log(p));
 *
 * // displays:
 * // [{ id: 1, name: 'JavaScript' }, { id: 1, name: 'TypeScript'}]
 * // [{ id: 2, name: 'Parcel' }, { id: 2, name: 'webpack'}]
 * // [{ id: 3, name: 'TSLint' }]
 * ```
 *
 * Pivot data on the `id` field
 *
 * ```ts
 * import { of, groupBy, mergeMap, reduce, map } from 'rxjs';
 *
 * of(
 *   { id: 1, name: 'JavaScript' },
 *   { id: 2, name: 'Parcel' },
 *   { id: 2, name: 'webpack' },
 *   { id: 1, name: 'TypeScript' },
 *   { id: 3, name: 'TSLint' }
 * ).pipe(
 *   groupBy(p => p.id, { element: p => p.name }),
 *   mergeMap(group$ => group$.pipe(reduce((acc, cur) => [...acc, cur], [`${ group$.key }`]))),
 *   map(arr => ({ id: parseInt(arr[0], 10), values: arr.slice(1) }))
 * )
 * .subscribe(p => console.log(p));
 *
 * // displays:
 * // { id: 1, values: [ 'JavaScript', 'TypeScript' ] }
 * // { id: 2, values: [ 'Parcel', 'webpack' ] }
 * // { id: 3, values: [ 'TSLint' ] }
 * ```
 *
 * @param key A function that extracts the key
 * for each item.
 * @param element A function that extracts the
 * return element for each item.
 * @param duration
 * A function that returns an Observable to determine how long each group should
 * exist.
 * @param connector Factory function to create an
 * intermediate Subject through which grouped elements are emitted.
 * @return A function that returns an Observable that emits GroupedObservables,
 * each of which corresponds to a unique key value and each of which emits
 * those items from the source Observable that share that key value.
 *
 * @deprecated Use the options parameter instead.
 */
export function groupBy<T, K, R>(
  key: (value: T) => K,
  element?: (value: T) => R,
  duration?: (grouped: GroupedObservable<K, R>) => Observable<any>,
  connector?: () => Subject<R>
): OperatorFunction<T, GroupedObservable<K, R>>;

// Impl
export function groupBy<T, K, R>(
  keySelector: (value: T) => K,
  elementOrOptions?: ((value: any) => any) | void | BasicGroupByOptions<K, T> | GroupByOptionsWithElement<K, R, T>,
  duration?: (grouped: GroupedObservable<any, any>) => ObservableInput<any>,
  connector?: () => SubjectLike<any>
): OperatorFunction<T, GroupedObservable<K, R>> {
  return (source) =>
    new Observable((destination) => {
      let element: ((value: any) => any) | void;
      if (!elementOrOptions || typeof elementOrOptions === 'function') {
        element = elementOrOptions as (value: any) => any;
      } else {
        ({ duration, element, connector } = elementOrOptions);
      }

      // A lookup for the groups that we have so far.
      const groups = new Map<K, SubjectLike<any>>();

      destination.add(() => {
        // Free up memory.
        groups.clear();
      });

      // Used for notifying all groups and the subscriber in the same way.
      const notify = (cb: (group: Observer<any>) => void) => {
        groups.forEach(cb);
        cb(destination);
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
      // Consider:  `rx(source, groupBy(fn), take(2))`.
      const groupBySourceSubscriber = operate({
        destination,
        next: (value: T) => {
          // Because we have to notify all groups of any errors that occur in here,
          // we have to add our own try/catch to ensure that those errors are propagated.
          // OperatorSubscriber will only send the error to the main subscriber.
          try {
            const key = keySelector(value);

            let group = groups.get(key);
            if (!group) {
              // Create our group subject
              groups.set(key, (group = connector ? connector() : new Subject<any>()));

              // Emit the grouped observable. Note that we can't do a simple `asObservable()` here,
              // because the grouped observable has special semantics around reference counting
              // to ensure we don't sever our connection to the source prematurely.
              const grouped = createGroupedObservable(key, group);
              destination.next(grouped);

              if (duration) {
                const durationSubscriber = operate({
                  // Providing the group here ensures that it is disposed of -- via `unsubscribe` --
                  // when the duration subscription is torn down. That is important, because then
                  // if someone holds a handle to the grouped observable and tries to subscribe to it
                  // after the connection to the source has been severed, they will get an
                  // `ObjectUnsubscribedError` and know they can't possibly get any notifications.
                  destination: group as any,
                  next: () => {
                    // Our duration notified! We can complete the group.
                    // The group will be removed from the map in the finalization phase.
                    group!.complete();
                    groups.delete(key);
                    durationSubscriber?.unsubscribe();
                  },
                  error: (err) => {
                    group!.error(err);
                    groups.delete(key);
                    durationSubscriber?.unsubscribe();
                  },
                  complete: () => {
                    groups.delete(key);
                    durationSubscriber?.unsubscribe();
                  },
                });

                // Start our duration notifier.
                groupBySourceSubscriber.add(from(duration(grouped)).subscribe(durationSubscriber));
              }
            }

            // Send the value to our group.
            group.next(element ? element(value) : value);
          } catch (err) {
            handleError(err);
          }
        },
        // Error from the source.
        error: handleError,
        // Source completes.
        complete: () => notify((consumer) => consumer.complete()),
      });

      // Subscribe to the source
      source.subscribe(groupBySourceSubscriber);

      /**
       * Creates the actual grouped observable returned.
       * @param key The key of the group
       * @param groupSubject The subject that fuels the group
       */
      function createGroupedObservable(key: K, groupSubject: SubjectLike<any>) {
        const result: any = new Observable<T>((groupSubscriber) => groupSubject.subscribe(groupSubscriber));
        result.key = key;
        return result;
      }
    });
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
