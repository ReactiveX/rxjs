/*
 * This file and its definitions are needed just so that ESDoc sees these
 * JSDoc documentation comments. Originally they were meant for some TypeScript
 * interfaces, but TypeScript strips away JSDoc comments near interfaces. Hence,
 * we need these bogus classes, which are not stripped away. This file on the
 * other hand, is not included in the release bundle.
 */
import { Subscriber } from './Subscriber';
import { TeardownLogic } from './Subscription';
import { Observable } from './Observable';
import './scheduler/MiscJSDoc';
import './observable/dom/MiscJSDoc';

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

/**
 * An interface for a consumer of push-based notifications delivered by an
 * {@link Observable}.
 *
 * ```ts
 * interface Observer<T> {
 *   closed?: boolean;
 *   next: (value: T) => void;
 *   error: (err: any) => void;
 *   complete: () => void;
 * }
 * ```
 *
 * An object conforming to the Observer interface is usually
 * given to the `observable.subscribe(observer)` method, and the Observable will
 * call the Observer's `next(value)` method to provide notifications. A
 * well-behaved Observable will call an Observer's `complete()` method exactly
 * once or the Observer's `error(err)` method exactly once, as the last
 * notification delivered.
 *
 * @interface
 * @name Observer
 * @noimport true
 */
export class ObserverDoc<T> {
  /**
   * An optional flag to indicate whether this Observer, when used as a
   * subscriber, has already been unsubscribed from its Observable.
   * @type {boolean}
   */
  closed: boolean = false;
  /**
   * The callback to receive notifications of type `next` from the Observable,
   * with a value. The Observable may call this method 0 or more times.
   * @param {T} value The `next` value.
   * @return {void}
   */
  next(value: T): void {
    return void 0;
  }
  /**
   * The callback to receive notifications of type `error` from the Observable,
   * with an attached {@link Error}. Notifies the Observer that the Observable
   * has experienced an error condition.
   * @param {any} err The `error` exception.
   * @return {void}
   */
  error(err: any): void {
    return void 0;
  }
  /**
   * The callback to receive a valueless notification of type `complete` from
   * the Observable. Notifies the Observer that the Observable has finished
   * sending push-based notifications.
   * @return {void}
   */
  complete(): void {
    return void 0;
  }
}

/**
 * `SubscribableOrPromise` interface describes values that behave like either
 * Observables or Promises. Every operator that accepts arguments annotated
 * with this interface, can be also used with parameters that are not necessarily
 * RxJS Observables.
 *
 * Following types of values might be passed to operators expecting this interface:
 *
 * ## Observable
 *
 * RxJS {@link Observable} instance.
 *
 * ## Observable-like (Subscribable)
 *
 * This might be any object that has `Symbol.observable` method. This method,
 * when called, should return object with `subscribe` method on it, which should
 * behave the same as RxJS `Observable.subscribe`.
 *
 * `Symbol.observable` is part of https://github.com/tc39/proposal-observable proposal.
 * Since currently it is not supported natively, and every symbol is equal only to itself,
 * you should use https://github.com/blesh/symbol-observable polyfill, when implementing
 * custom Observable-likes.
 *
 * **TypeScript Subscribable interface issue**
 *
 * Although TypeScript interface claims that Subscribable is an object that has `subscribe`
 * method declared directly on it, passing custom objects that have `subscribe`
 * method but not `Symbol.observable` method will fail at runtime. Conversely, passing
 * objects with `Symbol.observable` but without `subscribe` will fail at compile time
 * (if you use TypeScript).
 *
 * TypeScript has problem supporting interfaces with methods defined as symbol
 * properties. To get around that, you should implement `subscribe` directly on
 * passed object, and make `Symbol.observable` method simply return `this`. That way
 * everything will work as expected, and compiler will not complain. If you really
 * do not want to put `subscribe` directly on your object, you will have to type cast
 * it to `any`, before passing it to an operator.
 *
 * When this issue is resolved, Subscribable interface will only permit Observable-like
 * objects with `Symbol.observable` defined, no matter if they themselves implement
 * `subscribe` method or not.
 *
 * ## ES6 Promise
 *
 * Promise can be interpreted as Observable that emits value and completes
 * when it is resolved or errors when it is rejected.
 *
 * ## Promise-like (Thenable)
 *
 * Promises passed to operators do not have to be native ES6 Promises.
 * They can be implementations from popular Promise libraries, polyfills
 * or even custom ones. They just need to have `then` method that works
 * as the same as ES6 Promise `then`.
 *
 * @example <caption>Use merge and then map with non-RxJS observable</caption>
 * const nonRxJSObservable = {
 *   subscribe(observer) {
 *     observer.next(1000);
 *     observer.complete();
 *   },
 *   [Symbol.observable]() {
 *     return this;
 *   }
 * };
 *
 * Rx.Observable.merge(nonRxJSObservable)
 * .map(value => "This value is " + value)
 * .subscribe(result => console.log(result)); // Logs "This value is 1000"
 *
 *
 * @example <caption>Use combineLatest with ES6 Promise</caption>
 * Rx.Observable.combineLatest(Promise.resolve(5), Promise.resolve(10), Promise.resolve(15))
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('the end!')
 * );
 * // Logs
 * // [5, 10, 15]
 * // "the end!"
 *
 *
 * @interface
 * @name SubscribableOrPromise
 * @noimport true
 */
export class SubscribableOrPromiseDoc<T> {

}

/**
 * `ObservableInput` interface describes all values that are either an
 * {@link SubscribableOrPromise} or some kind of collection of values that
 * can be transformed to Observable emitting that values. Every operator that
 * accepts arguments annotated with this interface, can be also used with
 * parameters that are not necessarily RxJS Observables.
 *
 * `ObservableInput` extends {@link SubscribableOrPromise} with following types:
 *
 * ## Array
 *
 * Arrays can be interpreted as observables that emit all values in array one by one,
 * from left to right, and then complete immediately.
 *
 * ## Array-like
 *
 * Arrays passed to operators do not have to be built-in JavaScript Arrays. They
 * can be also, for example, `arguments` property available inside every function,
 * [DOM NodeList](https://developer.mozilla.org/pl/docs/Web/API/NodeList),
 * or, actually, any object that has `length` property (which is a number)
 * and stores values under non-negative (zero and up) integers.
 *
 * ## ES6 Iterable
 *
 * Operators will accept both built-in and custom ES6 Iterables, by treating them as
 * observables that emit all its values in order of iteration and then complete
 * when iteration ends. Note that contrary to arrays, Iterables do not have to
 * necessarily be finite, so creating Observables that never complete is possible as well.
 *
 * Note that you can make iterator an instance of Iterable by having it return itself
 * in `Symbol.iterator` method. It means that every operator accepting Iterables accepts,
 * though indirectly, iterators themselves as well. All native ES6 iterators are instances
 * of Iterable by default, so you do not have to implement their `Symbol.iterator` method
 * yourself.
 *
 * **TypeScript Iterable interface issue**
 *
 * TypeScript `ObservableInput` interface actually lacks type signature for Iterables,
 * because of issues it caused in some projects (see [this issue](https://github.com/ReactiveX/rxjs/issues/2306)).
 * If you want to use Iterable as argument for operator, cast it to `any` first.
 * Remember of course that, because of casting, you have to yourself ensure that passed
 * argument really implements said interface.
 *
 *
 * @example <caption>Use merge with arrays</caption>
 * Rx.Observable.merge([1, 2], [4], [5, 6])
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('ta dam!')
 * );
 *
 * // Logs
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * // 6
 * // "ta dam!"
 *
 *
 * @example <caption>Use merge with array-like</caption>
 * Rx.Observable.merge({0: 1, 1: 2, length: 2}, {0: 3, length: 1})
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('nice, huh?')
 * );
 *
 * // Logs
 * // 1
 * // 2
 * // 3
 * // "nice, huh?"
 *
 * @example <caption>Use merge with an Iterable (Map)</caption>
 * const firstMap = new Map([[1, 'a'], [2, 'b']]);
 * const secondMap = new Map([[3, 'c'], [4, 'd']]);
 *
 * Rx.Observable.merge(
 *   firstMap,          // pass Iterable
 *   secondMap.values() // pass iterator, which is itself an Iterable
 * ).subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('yup!')
 * );
 *
 * // Logs
 * // [1, "a"]
 * // [2, "b"]
 * // "c"
 * // "d"
 * // "yup!"
 *
 * @example <caption>Use from with generator (returning infinite iterator)</caption>
 * // infinite stream of incrementing numbers
 * const infinite = function* () {
 *   let i = 0;
 *
 *   while (true) {
 *     yield i++;
 *   }
 * };
 *
 * Rx.Observable.from(infinite())
 * .take(3) // only take 3, cause this is infinite
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('ta dam!')
 * );
 *
 * // Logs
 * // 0
 * // 1
 * // 2
 * // "ta dam!"
 *
 * @interface
 * @name ObservableInput
 * @noimport true
 */
export class ObservableInputDoc<T> {

}
