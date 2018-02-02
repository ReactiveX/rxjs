import { Observable } from '../Observable';
import { IScheduler } from '../Scheduler';
import { Subscriber } from '../Subscriber';

/**
 * Creates an Observable that emits no items to the Observer and immediately
 * emits an error notification.
 *
 * <span class="informal">Just emits 'error', and nothing else.
 * </span>
 *
 * <img src="./img/throw.png" width="100%">
 *
 * This static operator is useful for creating a simple Observable that only
 * emits the error notification. It can be used for composing with other
 * Observables, such as in a {@link mergeMap}.
 *
 * @example <caption>Emit the number 7, then emit an error.</caption>
 * var result = Rx.Observable.throw(new Error('oops!')).startWith(7);
 * result.subscribe(x => console.log(x), e => console.error(e));
 *
 * @example <caption>Map and flatten numbers to the sequence 'a', 'b', 'c', but throw an error for 13</caption>
 * var interval = Rx.Observable.interval(1000);
 * var result = interval.mergeMap(x =>
 *   x === 13 ?
 *     Rx.Observable.throw('Thirteens are bad') :
 *     Rx.Observable.of('a', 'b', 'c')
 * );
 * result.subscribe(x => console.log(x), e => console.error(e));
 *
 * @see {@link create}
 * @see {@link empty}
 * @see {@link never}
 * @see {@link of}
 *
 * @param {any} error The particular Error to pass to the error notification.
 * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling
 * the emission of the error notification.
 * @return {Observable} An error Observable: emits only the error notification
 * using the given error argument.
 * @static true
 * @name throw
 * @owner Observable
 */
export function throwError(error: any, scheduler?: IScheduler): Observable<never> {
  if (!scheduler) {
    return new Observable(subscriber => subscriber.error(error));
  } else {
    return new Observable(subscriber => scheduler.schedule(dispatch, 0, { error, subscriber }));
  }
}

interface DispatchArg {
  error: any;
  subscriber: Subscriber<any>;
}

function dispatch({ error, subscriber }: DispatchArg) {
  subscriber.error(error);
}
