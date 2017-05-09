import { Observable } from '../Observable';
import { Observer } from '../Observer';
import { Subscription } from '../Subscription';

/**
 * Returns a new Observable the multicasts (shares) the values that arrive on the Observable
 * with all other subscribers. Any message that arrives from the source prior to subscription
 * will be shared with later subscribers. The only caveat to this is when the source errors,
 * in which case the internal state/cache is reset, and the returned observable awaits another
 * subscription which will kick off the process again. It effectively goes "cold" if an error occurs.
 * Conversely, if the source completes successfully, all subsequent subscribers will get the values
 * that arrived up to that point and the completion played to them as soon as possible.
 *
 * This operator is primarily designed to mimic the "promise-like" behavior of multicasting and
 * caching resolved values for later use. The primary use case here is for things like AJAX.
 *
 * Both subscriptions below will only cause the AJAX to fire one time. If you were to subscribe
 * to `getExampleJSON$` at a time after it resolved, it would just give you the resolved value
 *
 * <img src="./img/shareResults.png" width="100%">
 *
 * @example
 * const getExampleJSON$ = Rx.ajax.getJSON('http://example.com')
 *   .shareResults();
 *
 * getExampleJSON$.subscribe(x => useExampleData1(x));
 * getExampleJSON$.filter(x => x.length > 2).subscribe(x => useExampleData2(x));
 * @return {Observable<T>} an Observable that upon connection causes the source Observable to emit items to its Observers
 * @method shareResults
 * @owner Observable
 */
export function shareResults<T>(this: Observable<T>): Observable<T> {
  const observers: Observer<T>[] = [];
  let values: T[] = [];
  let completed = false;
  let subscription: Subscription = null;

  const sendNext = (value: T) => {
    values.push(value);
    observers.forEach(o => o.next(value));
  };

  const sendError = (err: any) => {
    values = [];
    subscription = null;
    while (observers.length > 0) {
      observers.shift().error(err);
    }
  };

  const sendComplete = () => {
    completed = true;
    while (observers.length > 0) {
      observers.shift().complete();
    }
  };

  return new Observable<T>((observer: Observer<T>) => {
    observers.push(observer);

    values.forEach((value: T) => {
      observer.next(value);
    });

    if (completed) {
      observer.complete();
    }

    if (!subscription) {
      subscription = this.subscribe(
        sendNext,
        sendError,
        sendComplete
      );
    }

    return () => {
      const i = observers.indexOf(observer);
      if (i !== -1) {
        observers.splice(i, 1);
      }

      if (observers.length === 0 && subscription) {
        subscription.unsubscribe();
      }
    };
  });
}