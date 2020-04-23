import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { Observable } from '../Observable';
import { MonoTypeOperatorFunction, TeardownLogic } from '../types';
import { subscribeWith } from '../util/subscribeWith';

/**
 * Returns an Observable that mirrors the source Observable, but will call a specified function when
 * the source terminates on complete or error.
 * The specified function will also be called when the subscriber explicitly unsubscribes.
 *
 * ## Examples
 * Execute callback function when the observable completes
 *
 * ```ts
 * import { interval } from 'rxjs';
 * import { take, finalize } from 'rxjs/operators';
 *
 * // emit value in sequence every 1 second
 * const source = interval(1000);
 * const example = source.pipe(
 *   take(5), //take only the first 5 values
 *   finalize(() => console.log('Sequence complete')) // Execute when the observable completes
 * )
 * const subscribe = example.subscribe(val => console.log(val));
 *
 * // results:
 * //   0
 * //   1
 * //   2
 * //   3
 * //   4
 * //   'Sequence complete'
 * ```
 *
 * Execute callback function when the subscriber explicitly unsubscribes
 *
 * ```ts
 * import { interval, timer, noop } from 'rxjs';
 * import { finalize, tap } from 'rxjs/operators';
 *
 * const source = interval(100).pipe(
 *   finalize(() => console.log('[finalize] Called')),
 *    tap(() => console.log('[next] Called'),
 *      () => console.log('[error] Not called'),
 *      () => console.log('[tap] Not called')),
 * );
 *
 * const sub = source.subscribe(x => console.log(x), noop, () => console.log('[complete] Not called'));
 *
 * timer(150).subscribe(() => sub.unsubscribe());
 *
 * // results:
 * //   0
 * //   '[finalize] Called'
 * ```
 *
 * @param {function} callback Function to be called when source terminates.
 * @return {Observable} An Observable that mirrors the source, but will call the specified function on termination.
 * @name finally
 */
export function finalize<T>(callback: () => void): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(new FinallyOperator(callback));
}

class FinallyOperator<T> implements Operator<T, T> {
  constructor(private callback: () => void) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return subscribeWith(source, new FinallySubscriber(subscriber, this.callback));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class FinallySubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>, callback: () => void) {
    super(destination);
    this.add(new Subscription(callback));
  }
}
