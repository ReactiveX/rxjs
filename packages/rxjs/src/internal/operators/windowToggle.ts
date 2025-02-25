import { Observable, Subscription, from, operate } from '@rxjs/observable';
import { Subject } from '../Subject.js';
import type { ObservableInput, OperatorFunction } from '../types.js';
import { noop } from '../util/noop.js';
import { arrRemove } from '../util/arrRemove.js';

/**
 * Branch out the source Observable values as a nested Observable starting from
 * an emission from `openings` and ending when the output of `closingSelector`
 * emits.
 *
 * <span class="informal">It's like {@link bufferToggle}, but emits a nested
 * Observable instead of an array.</span>
 *
 * ![](windowToggle.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits windows that contain those items
 * emitted by the source Observable between the time when the `openings`
 * Observable emits an item and when the Observable returned by
 * `closingSelector` emits an item.
 *
 * ## Example
 *
 * Every other second, emit the click events from the next 500ms
 *
 * ```ts
 * import { fromEvent, interval, windowToggle, EMPTY, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const openings = interval(1000);
 * const result = clicks.pipe(
 *   windowToggle(openings, i => i % 2 ? interval(500) : EMPTY),
 *   mergeAll()
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowWhen}
 * @see {@link bufferToggle}
 *
 * @param openings An observable of notifications to start new windows.
 * @param closingSelector A function that takes the value emitted by the
 * `openings` observable and returns an Observable, which, when it emits a next
 * notification, signals that the associated window should complete.
 * @return A function that returns an Observable of windows, which in turn are
 * Observables.
 */
export function windowToggle<T, O>(
  openings: ObservableInput<O>,
  closingSelector: (openValue: O) => ObservableInput<any>
): OperatorFunction<T, Observable<T>> {
  return (source) =>
    new Observable((destination) => {
      const windows: Subject<T>[] = [];

      destination.add(() => {
        // Add this finalization so that all window subjects are
        // disposed of. This way, if a user tries to subscribe
        // to a window *after* the outer subscription has been unsubscribed,
        // they will get an error, instead of waiting forever to
        // see if a value arrives.
        while (0 < windows.length) {
          windows.shift()!.unsubscribe();
        }
      });

      const handleError = (err: any) => {
        while (0 < windows.length) {
          windows.shift()!.error(err);
        }
        destination.error(err);
      };

      from(openings).subscribe(
        operate({
          destination,
          next: (openValue) => {
            const window = new Subject<T>();
            windows.push(window);
            const closingSubscription = new Subscription();
            const closeWindow = () => {
              arrRemove(windows, window);
              window.complete();
              closingSubscription.unsubscribe();
            };

            let closingNotifier: Observable<any>;
            try {
              closingNotifier = from(closingSelector(openValue));
            } catch (err) {
              handleError(err);
              return;
            }

            // TODO: We should probably make this `.asObservable()`, but we've historically
            // had windows throw an `ObjectUnsubscribedError` if you try to subscribe to them
            // late. We should probably change that: (https://github.com/ReactiveX/rxjs/issues/7200)
            destination.next(window);

            closingSubscription.add(
              closingNotifier.subscribe(
                operate({
                  destination,
                  next: closeWindow,
                  error: handleError,
                  complete: noop,
                })
              )
            );
          },
          complete: noop,
        })
      );

      // Subscribe to the source to get things started.
      source.subscribe(
        operate({
          destination,
          next: (value: T) => {
            // Copy the windows array before we emit to
            // make sure we don't have issues with reentrant code.
            const windowsCopy = windows.slice();
            for (const window of windowsCopy) {
              window.next(value);
            }
          },
          error: handleError,
          complete: () => {
            // Complete all of our windows before we complete.
            while (0 < windows.length) {
              windows.shift()!.complete();
            }
            destination.complete();
          },
        })
      );
    });
}
