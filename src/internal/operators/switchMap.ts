/** @prettier */
import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { ObservableInput, OperatorFunction, ObservedValueOf } from '../types';
import { map } from './map';
import { from } from '../observable/from';
import { lift } from '../util/lift';
import { SimpleInnerSubscriber, innerSubscribe, SimpleOuterSubscriber } from '../innerSubscribe';

/* tslint:disable:max-line-length */
export function switchMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O>>;
/** @deprecated resultSelector is no longer supported, use inner map instead */
export function switchMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: undefined
): OperatorFunction<T, ObservedValueOf<O>>;
/** @deprecated resultSelector is no longer supported, use inner map instead */
export function switchMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * Projects each source value to an Observable which is merged in the output
 * Observable, emitting values only from the most recently projected Observable.
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables.</span>
 *
 * ![](switchMap.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an (so-called "inner") Observable. Each time it observes one of these
 * inner Observables, the output Observable begins emitting the items emitted by
 * that inner Observable. When a new inner Observable is emitted, `switchMap`
 * stops emitting items from the earlier-emitted inner Observable and begins
 * emitting items from the new one. It continues to behave like this for
 * subsequent inner Observables.
 *
 * ## Example
 * Generate new Observable according to source Observable values
 * ```typescript
 * import { of } from 'rxjs';
 * import { switchMap } from 'rxjs/operators';
 *
 * const switched = of(1, 2, 3).pipe(switchMap((x: number) => of(x, x ** 2, x ** 3)));
 * switched.subscribe(x => console.log(x));
 * // outputs
 * // 1
 * // 1
 * // 1
 * // 2
 * // 4
 * // 8
 * // ... and so on
 * ```
 *
 * Rerun an interval Observable on every click event
 * ```ts
 * import { fromEvent, interval } from 'rxjs';
 * import { switchMap } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(switchMap((ev) => interval(1000)));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link concatMap}
 * @see {@link exhaustMap}
 * @see {@link mergeMap}
 * @see {@link switchAll}
 * @see {@link switchMapTo}
 *
 * @param {function(value: T, ?index: number): ObservableInput} project A function
 * that, when applied to an item emitted by the source Observable, returns an
 * Observable.
 * @return {Observable} An Observable that emits the result of applying the
 * projection function (and the optional deprecated `resultSelector`) to each item
 * emitted by the source Observable and taking only the values from the most recently
 * projected inner Observable.
 * @name switchMap
 */
export function switchMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector?: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, ObservedValueOf<O> | R> {
  if (typeof resultSelector === 'function') {
    return (source: Observable<T>) =>
      source.pipe(switchMap((a, i) => from(project(a, i)).pipe(map((b, ii) => resultSelector(a, b, i, ii)))));
  }
  return (source: Observable<T>) =>
    lift(source, function (this: Subscriber<ObservedValueOf<O>>, source: Observable<T>) {
      const subscriber = this;
      let index = 0;
      // The inner subscriber, which is also the inner subscription.
      // The truthiness of this is checked to see if we still have an active inner subscription
      let innerSubs: Subscriber<any> | null = null;
      // Whether or not the outer subscription has completed.
      let isComplete = false;

      // Used to subscribe to the source. Captured here, so that in the complete step
      // we can make sure to unsubscribe it if we can and clean up asap.
      const outerSubscriber = new SwitchMapSubscriber<T>(
        subscriber,
        (value) => {
          // We got a new value, unsubscribe from the previous inner source
          // if we have a subscription, and prepare to get the next inner source
          innerSubs?.unsubscribe();
          innerSubs = null;

          // Get the next inner source
          let innerSource: Observable<ObservedValueOf<O>>;
          try {
            innerSource = from(project(value, index++));
          } catch (err) {
            subscriber.error(err);
            return;
          }

          // Create the next inner subscriber and set the `innerSubs`, which is also used to
          // see if we have an active subscription or not. We do this ahead of the act of
          // subscription to prevent problems with reentrant code.
          innerSubs = new SwitchMapSubscriber(
            subscriber,
            (innerValue) => {
              // INNER NEXT
              // Emit the inner values to the consumer.
              subscriber.next(innerValue);
            },
            () => {
              // INNER COMPLETE
              // Be sure to clean up on inner subscription and clear it so we
              // know we don't have any active subscriptions right now,
              // otherwise if the outer completes, we won't know to complete.
              innerSubs?.unsubscribe();
              innerSubs = null;
              if (isComplete) {
                // If the outer is complete, we can't get any more values to switchMap,
                // so we can complete the resulting subscription.
                subscriber.complete();
              }
            }
          );

          // Subscribe to the inner source.
          innerSource.subscribe(innerSubs);
        },
        () => {
          // OUTER COMPLETE
          isComplete = true;
          if (!innerSubs) {
            // If we don't have an inner subscription right now, nothing is active,
            // since we just completed, we can't get anything else, so complete the resulting
            // subscription.
            subscriber.complete();
          }
          // Ensure we clean up the outer subscription as soon as possible.
          outerSubscriber?.unsubscribe();
        }
      );

      source.subscribe(outerSubscriber);
    });
}

class SwitchMapSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<any>, protected _next: (value: T) => void, protected _complete: () => void) {
    super(destination);
  }
}
