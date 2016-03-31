/*
 * This file and its definitions are needed just so that ESDoc sees these
 * JSDoc documentation comments. Originally they were meant for some TypeScript
 * interfaces, but TypeScript strips away JSDoc comments near interfaces. Hence,
 * we need these bogus classes, which are not stripped away. This file on the
 * other hand, is not included in the release bundle.
 */
import {Subscriber} from './Subscriber';
import {TeardownLogic} from './Subscription';
import {Observable} from './Observable';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ObservableDoc {
  /**
   * Creates a new Observable that will execute the specified function when a
   * {@link Subscriber} subscribes to it.
   *
   * <span class="informal">Creates an Observable with custom logic given in
   * the `subscribe` function.</span>
   *
   * <img src="./img/create.png" width="100%">
   *
   * `create` converts a `subscribe` function to an actual Observable. This is
   * equivalent to calling the Observable constructor. Write the `subscribe`
   * function so that it behaves as an Observable: It should invoke the
   * Subscriber's `next`, `error`, and `complete` methods following the
   * *Observable Contract*. A well-formed Observable must invoke either the
   * Subscriber's `complete` method exactly once or its `error` method exactly
   * once, and invoke nothing else thereafter.
   *
   * Most of the times you should not need to use `create` because existing
   * creation operators (together with instance combination operators) allow you
   * to create an Observable for most of the use cases. However, `create` is
   * low-level and is able to create any Observable.
   *
   * @example <caption>Emit three random numbers, then complete.</caption>
   * var result = Rx.Observable.create(function (subscriber) {
   *   subscriber.next(Math.random());
   *   subscriber.next(Math.random());
   *   subscriber.next(Math.random());
   *   subscriber.complete();
   * });
   * result.subscribe(x => console.log(x));
   *
   * @see {@link empty}
   * @see {@link never}
   * @see {@link of}
   * @see {@link throw}
   *
   * @param {function(subscriber: Subscriber): TeardownLogic} [subscribe] A
   * function that accepts a {@link Subscriber}, and invokes its `next`,
   * `error`, and `complete` methods as appropriate, and should return some
   * logic for tear down, either as a {@link Subscription} or as a function.
   * @return {Observable} An Observable that, when subscribed, will execute the
   * specified function.
   * @static true
   * @name create
   * @owner Observable
   */
  static create<T>(subscribe?: <R>(subscriber: Subscriber<R>) => TeardownLogic): Observable<T> {
    return new Observable<T>(subscribe);
  };
}
