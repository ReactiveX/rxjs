// https://github.com/microsoft/TypeScript/issues/40462#issuecomment-689879308
/// <reference lib="esnext.asynciterable" />

import type { Observable, Subscription } from './Observable.js';

/**
 * Note: This will add Symbol.observable globally for all TypeScript users,
 * however, we are no longer polyfilling Symbol.observable
 */
declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

/* OPERATOR INTERFACES */

/**
 * A function type interface that describes a function that accepts one parameter `T`
 * and returns another parameter `R`.
 *
 * Usually used to describe {@link OperatorFunction} - it always takes a single
 * parameter (the source Observable) and returns another Observable.
 */
export interface UnaryFunction<T, R> {
  (source: T): R;
}

export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> {}

/* SUBSCRIPTION INTERFACES */

export interface Unsubscribable {
  unsubscribe(): void;
}

export type TeardownLogic = Subscription | Unsubscribable | (() => void) | void;

export interface SubscriptionLike extends Unsubscribable {
  unsubscribe(): void;
  readonly closed: boolean;
}

/* OBSERVABLE INTERFACES */

export interface Subscribable<T> {
  subscribe(observer: Partial<Observer<T>>): Unsubscribable;
}

/**
 * Valid types that can be converted to observables.
 */
export type ObservableInput<T> =
  | Observable<T>
  | InteropObservable<T>
  | AsyncIterable<T>
  | PromiseLike<T>
  | ArrayLike<T>
  | Iterable<T>
  | ReadableStreamLike<T>;

/**
 * An object that implements the `Symbol.observable` interface.
 */
export interface InteropObservable<T> {
  [Symbol.observable]: () => Subscribable<T>;
}

/* NOTIFICATIONS */

/**
 * A notification representing a "next" from an observable.
 * Can be used with {@link dematerialize}.
 */
export interface NextNotification<T> {
  /** The kind of notification. Always "N" */
  kind: 'N';
  /** The value of the notification. */
  value: T;
}

/**
 * A notification representing an "error" from an observable.
 * Can be used with {@link dematerialize}.
 */
export interface ErrorNotification {
  /** The kind of notification. Always "E" */
  kind: 'E';
  error: any;
}

/**
 * A notification representing a "completion" from an observable.
 * Can be used with {@link dematerialize}.
 */
export interface CompleteNotification {
  kind: 'C';
}

/**
 * Valid observable notification types.
 */
export type ObservableNotification<T> = NextNotification<T> | ErrorNotification | CompleteNotification;

/**
 * An object interface that defines a set of callback functions a user can use to get
 * notified of any set of {@link Observable}
 * {@link guide/glossary-and-semantics#notification notification} events.
 *
 * For more info, please refer to {@link guide/observer this guide}.
 */
export interface Observer<T> {
  /**
   * A callback function that gets called by the producer during the subscription when
   * the producer "has" the `value`. It won't be called if `error` or `complete` callback
   * functions have been called, nor after the consumer has unsubscribed.
   *
   * For more info, please refer to {@link guide/glossary-and-semantics#next this guide}.
   */
  next: (value: T) => void;
  /**
   * A callback function that gets called by the producer if and when it encountered a
   * problem of any kind. The errored value will be provided through the `err` parameter.
   * This callback can't be called more than one time, it can't be called if the
   * `complete` callback function have been called previously, nor it can't be called if
   * the consumer has unsubscribed.
   *
   * For more info, please refer to {@link guide/glossary-and-semantics#error this guide}.
   */
  error: (err: any) => void;
  /**
   * A callback function that gets called by the producer if and when it has no more
   * values to provide (by calling `next` callback function). This means that no error
   * has happened. This callback can't be called more than one time, it can't be called
   * if the `error` callback function have been called previously, nor it can't be called
   * if the consumer has unsubscribed.
   *
   * For more info, please refer to {@link guide/glossary-and-semantics#complete this guide}.
   */
  complete: () => void;
}

/**
 * Extracts the type from an `ObservableInput<any>`. If you have
 * `O extends ObservableInput<any>` and you pass in `Observable<number>`, or
 * `Promise<number>`, etc, it will type as `number`.
 */
export type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;

/**
 * The base signature RxJS will look for to identify and use
 * a [ReadableStream](https://streams.spec.whatwg.org/#rs-class)
 * as an {@link ObservableInput} source.
 */
export type ReadableStreamLike<T> = Pick<ReadableStream<T>, 'getReader'>;

export type ValueFromArray<T> = T extends ArrayLike<infer R> ? R : never;
