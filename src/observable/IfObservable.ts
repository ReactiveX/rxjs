import { Observable, SubscribableOrPromise } from '../Observable';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';

import { subscribeToResult } from '../util/subscribeToResult';
import { OuterSubscriber } from '../OuterSubscriber';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class IfObservable<T, R> extends Observable<T> {

  /**
   * Decides at subscription time which Observable will actually be subscribed.
   *
   * <span class="informal">`If` statement for Observables.</span>
   *
   * `if` accepts a condition function and two Observables. When
   * an Observable returned by the operator is subscribed, condition function will be called.
   * Based on what boolean it returns at that moment, consumer will subscribe either to
   * the first Observable (if condition was true) or to the second (if condition was false). Condition
   * function may also not return anything - in that case condition will be evaluated as false and
   * second Observable will be subscribed.
   *
   * Note that Observables for both cases (true and false) are optional. If condition points to an Observable that
   * was left undefined, resulting stream will simply complete immediately. That allows you to, rather
   * then controlling which Observable will be subscribed, decide at runtime if consumer should have access
   * to given Observable or not.
   *
   * If you have more complex logic that requires decision between more than two Observables, {@link defer}
   * will probably be a better choice. Actually `if` can be easily implemented with {@link defer}
   * and exists only for convenience and readability reasons.
   *
   *
   * @example <caption>Change at runtime which Observable will be subscribed</caption>
   * let subscribeToFirst;
   * const firstOrSecond = Rx.Observable.if(
   *   () => subscribeToFirst,
   *   Rx.Observable.of('first'),
   *   Rx.Observable.of('second')
   * );
   *
   * subscribeToFirst = true;
   * firstOrSecond.subscribe(value => console.log(value));
   *
   * // Logs:
   * // "first"
   *
   * subscribeToFirst = false;
   * firstOrSecond.subscribe(value => console.log(value));
   *
   * // Logs:
   * // "second"
   *
   *
   * @example <caption>Control an access to an Observable</caption>
   * let accessGranted;
   * const observableIfYouHaveAccess = Rx.Observable.if(
   *   () => accessGranted,
   *   Rx.Observable.of('It seems you have an access...') // Note that only one Observable is passed to the operator.
   * );
   *
   * accessGranted = true;
   * observableIfYouHaveAccess.subscribe(
   *   value => console.log(value),
   *   err => {},
   *   () => console.log('The end')
   * );
   *
   * // Logs:
   * // "It seems you have an access..."
   * // "The end"
   *
   * accessGranted = false;
   * observableIfYouHaveAccess.subscribe(
   *   value => console.log(value),
   *   err => {},
   *   () => console.log('The end')
   * );
   *
   * // Logs:
   * // "The end"
   *
   * @see {@link defer}
   *
   * @param {function(): boolean} condition Condition which Observable should be chosen.
   * @param {Observable} [trueObservable] An Observable that will be subscribed if condition is true.
   * @param {Observable} [falseObservable] An Observable that will be subscribed if condition is false.
   * @return {Observable} Either first or second Observable, depending on condition.
   * @static true
   * @name if
   * @owner Observable
   */
  static create<T, R>(condition: () => boolean | void,
                      thenSource?: SubscribableOrPromise<T> | void,
                      elseSource?: SubscribableOrPromise<R> | void): Observable<T|R> {
    return new IfObservable(condition, thenSource, elseSource);
  }

  constructor(private condition: () => boolean | void,
              private thenSource?: SubscribableOrPromise<T> | void,
              private elseSource?: SubscribableOrPromise<R> | void) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T|R>): TeardownLogic {
    const { condition, thenSource, elseSource } = this;

    return new IfSubscriber(subscriber, condition, thenSource, elseSource);
  }
}

class IfSubscriber<T, R> extends OuterSubscriber<T, T> {
  constructor(destination: Subscriber<T>,
              private condition: () => boolean | void,
              private thenSource?: SubscribableOrPromise<T> | void,
              private elseSource?: SubscribableOrPromise<R> | void) {
    super(destination);
    this.tryIf();
  }

  private tryIf(): void {
    const { condition, thenSource, elseSource } = this;

    let result: boolean;
    try {
      result = <boolean>condition();
      const source = result ? thenSource : elseSource;

      if (source) {
        this.add(subscribeToResult(this, source));
      } else {
        this._complete();
      }
    } catch (err) {
      this._error(err);
    }
  }
}
