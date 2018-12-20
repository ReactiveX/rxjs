import { ObservableInput } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { from } from './from';

/**
 * Returns an Observable that mirrors the first source Observable to emit an item.
 *
 * ## Example
 * ### Subscribes to the observable that was the first to start emitting.
 *
 * ```javascript
 * const obs1 = interval(1000).pipe(mapTo('fast one'));
 * const obs2 = interval(3000).pipe(mapTo('medium one'));
 * const obs3 = interval(5000).pipe(mapTo('slow one'));
 *
 * race(obs3, obs1, obs2)
 * .subscribe(
 *   winner => console.log(winner)
 * );
 *
 * // result:
 * // a series of 'fast one'
 * ```
 *
 * @param {...ObservableInput<T>[]} sources ...observables sources used to race for which Observable emits first.
 * @return {ObservableInput[]} an Observable that mirrors the output of the first Observable to emit an item.
 * @static true
 * @name race
 * @owner Observable
 */
export function race<T>(sources: Array<ObservableInput<T>>): Observable<T>;
export function race<T>(...sources: ObservableInput<T>[]): Observable<T>;
export function race<T>(...sources: ObservableInput<T>[]): Observable<T> {
  if (sources.length === 1 && Array.isArray(sources[0])) {
    sources = sources[0] as any;
  }
  return new Observable<T>(subscriber => {
    const subscription = new Subscription();
    let subscriptions: Subscription[]|null = [];

    for (let s = 0; s < sources.length && !subscriber.closed; s++) {
      const source = from(sources[s]);
      const innerSubs = source.subscribe({
        next(value) {
          if (subscriptions) {
            for (let i = 0; i < subscriptions.length; i++) {
              if (i !== s) {
                subscriptions[i].unsubscribe();
              }
            }
            subscriptions = null;
          }
          subscriber.next(value);
        },
        error(err: any) { subscriber.error(err); },
        complete() { subscriber.complete(); },
      });
      subscriptions.push(innerSubs);
      subscription.add(innerSubs);
    }

    return subscription;
  });
}
