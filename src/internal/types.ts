// https://github.com/microsoft/TypeScript/issues/40462#issuecomment-689879308
/// <reference lib="esnext.asynciterable" />

import { Observable } from './Observable';
import { Subscription } from './Subscription';
import { Subscriber } from './Subscriber';

/**
 * Note: This will add Symbol.observable globally for all TypeScript users,
 * however, we are no longer polyfilling Symbol.observable
 */
declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

/** OPERATOR INTERFACES */

export interface UnaryFunction<T, R> {
  (source: T): R;
}

export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> {}

export type FactoryOrValue<T> = T | (() => T);

export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> {}

/**
 * A value and the time at which it was emitted.
 *
 * Emitted by the `timestamp` operator
 *
 * @see {@link timestamp}
 */
export interface Timestamp<T> {
  value: T;
  /**
   * The timestamp. By default, this is in epoch milliseconds.
   * Could vary based on the timestamp provider passed to the operator.
   */
  timestamp: number;
}

/**
 * A value emitted and the amount of time since the last value was emitted.
 *
 * Emitted by the `timeInterval` operator.
 *
 * @see {@link timeInterval}
 */
export interface TimeInterval<T> {
  value: T;

  /**
   * The amount of time between this value's emission and the previous value's emission.
   * If this is the first emitted value, then it will be the amount of time since subscription
   * started.
   */
  interval: number;
}

/** SUBSCRIPTION INTERFACES */

export interface Unsubscribable {
  unsubscribe(): void;
}

export type TeardownLogic = Subscription | Unsubscribable | (() => void) | void;

export interface SubscriptionLike extends Unsubscribable {
  unsubscribe(): void;
  readonly closed: boolean;
}

/** @deprecated To be removed in v8. Do not use. Most likely you want to use `ObservableInput` */
export type SubscribableOrPromise<T> = Subscribable<T> | Subscribable<never> | PromiseLike<T> | InteropObservable<T>;

/** OBSERVABLE INTERFACES */

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

/** @deprecated use {@link InteropObservable } */
export type ObservableLike<T> = InteropObservable<T>;

/**
 * An object that implements the `Symbol.observable` interface.
 */
export interface InteropObservable<T> {
  [Symbol.observable]: () => Subscribable<T>;
}

/** NOTIFICATIONS */

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

/** OBSERVER INTERFACES */

export interface NextObserver<T> {
  closed?: boolean;
  next: (value: T) => void;
  error?: (err: any) => void;
  complete?: () => void;
}

export interface ErrorObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error: (err: any) => void;
  complete?: () => void;
}

export interface CompletionObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error?: (err: any) => void;
  complete: () => void;
}

export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>;

export interface Observer<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

export interface SubjectLike<T> extends Observer<T>, Subscribable<T> {}

/** SCHEDULER INTERFACES */

export interface SchedulerLike extends TimestampProvider {
  schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
}

export interface SchedulerAction<T> extends Subscription {
  schedule(state?: T, delay?: number): Subscription;
}

/**
 * This is a type that provides a method to allow RxJS to create a numeric timestamp
 */
export interface TimestampProvider {
  /**
   * Returns a timestamp as a number.
   *
   * This is used by types like `ReplaySubject` or operators like `timestamp` to calculate
   * the amount of time passed between events.
   */
  now(): number;
}

/**
 * Extracts the type from an `ObservableInput<any>`. If you have
 * `O extends ObservableInput<any>` and you pass in `Observable<number>`, or
 * `Promise<number>`, etc, it will type as `number`.
 */
export type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;

/**
 * Extracts a union of element types from an `ObservableInput<any>[]`.
 * If you have `O extends ObservableInput<any>[]` and you pass in
 * `Observable<string>[]` or `Promise<string>[]` you would get
 * back a type of `string`.
 * If you pass in `[Observable<string>, Observable<number>]` you would
 * get back a type of `string | number`.
 */
export type ObservedValueUnionFromArray<X> = X extends Array<ObservableInput<infer T>> ? T : never;

/** @deprecated use {@link ObservedValueUnionFromArray} */
export type ObservedValuesFromArray<X> = ObservedValueUnionFromArray<X>;

/**
 * Extracts a tuple of element types from an `ObservableInput<any>[]`.
 * If you have `O extends ObservableInput<any>[]` and you pass in
 * `[Observable<string>, Observable<number>]` you would get back a type
 * of `[string, number]`.
 */
export type ObservedValueTupleFromArray<X> = { [K in keyof X]: ObservedValueOf<X[K]> };

/**
 * Used to infer types from arguments to functions like {@link forkJoin}.
 * So that you can have `forkJoin([Observable<A>, PromiseLike<B>]): Observable<[A, B]>`
 * et al.
 */
export type ObservableInputTuple<T> = {
  [K in keyof T]: ObservableInput<T[K]>;
};

/**
 * Constructs a new tuple with the specified type at the head.
 * If you declare `Cons<A, [B, C]>` you will get back `[A, B, C]`.
 */
export type Cons<X, Y extends readonly any[]> = ((arg: X, ...rest: Y) => any) extends (...args: infer U) => any ? U : never;

/**
 * Extracts the head of a tuple.
 * If you declare `Head<[A, B, C]>` you will get back `A`.
 */
export type Head<X extends readonly any[]> = ((...args: X) => any) extends (arg: infer U, ...rest: any[]) => any ? U : never;

/**
 * Extracts the tail of a tuple.
 * If you declare `Tail<[A, B, C]>` you will get back `[B, C]`.
 */
export type Tail<X extends readonly any[]> = ((...args: X) => any) extends (arg: any, ...rest: infer U) => any ? U : never;

/**
 * Extracts the generic value from an Array type.
 * If you have `T extends Array<any>`, and pass a `string[]` to it,
 * `ValueFromArray<T>` will return the actual type of `string`.
 */
export type ValueFromArray<A extends readonly unknown[]> = A extends Array<infer T> ? T : never;

/**
 * Gets the value type from an {@link ObservableNotification}, if possible.
 */
export type ValueFromNotification<T> = T extends { kind: 'N' | 'E' | 'C' }
  ? T extends NextNotification<any>
    ? T extends { value: infer V }
      ? V
      : undefined
    : never
  : never;

/**
 * A simple type to represent a gamut of "falsy" values... with a notable exception:
 * `NaN` is "falsy" however, it is not and cannot be typed via TypeScript. See
 * comments here: https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417
 */
export type Falsy = null | undefined | false | 0 | -0 | 0n | '';

export type TruthyTypesOf<T> = T extends Falsy ? never : T;

// We shouldn't rely on this type definition being available globally yet since it's
// not necessarily available in every TS environment.
interface ReadableStreamDefaultReaderLike<T> {
  // HACK: As of TS 4.2.2, The provided types for the iterator results of a `ReadableStreamDefaultReader`
  // are significantly different enough from `IteratorResult` as to cause compilation errors.
  // The type at the time is `ReadableStreamDefaultReadResult`.
  read(): PromiseLike<
    | {
        done: false;
        value: T;
      }
    | { done: true; value?: undefined }
  >;
  releaseLock(): void;
}

/**
 * The base signature RxJS will look for to identify and use
 * a [ReadableStream](https://streams.spec.whatwg.org/#rs-class)
 * as an {@link ObservableInput} source.
 */
export interface ReadableStreamLike<T> {
  getReader(): ReadableStreamDefaultReaderLike<T>;
}

/**
 * The global configuration object for RxJS, used to configure things
 * like how to react on unhandled errors. Accessible via {@link config}
 * object.
 */
export interface GlobalConfig {
  /**
   * A registration point for unhandled errors from RxJS. These are errors that
   * cannot were not handled by consuming code in the usual subscription path. For
   * example, if you have this configured, and you subscribe to an observable without
   * providing an error handler, errors from that subscription will end up here. This
   * will _always_ be called asynchronously on another job in the runtime. This is because
   * we do not want errors thrown in this user-configured handler to interfere with the
   * behavior of the library.
   */
  onUnhandledError: ((err: any) => void) | null;

  /**
   * A registration point for notifications that cannot be sent to subscribers because they
   * have completed, errored or have been explicitly unsubscribed. By default, next, complete
   * and error notifications sent to stopped subscribers are noops. However, sometimes callers
   * might want a different behavior. For example, with sources that attempt to report errors
   * to stopped subscribers, a caller can configure RxJS to throw an unhandled error instead.
   * This will _always_ be called asynchronously on another job in the runtime. This is because
   * we do not want errors thrown in this user-configured handler to interfere with the
   * behavior of the library.
   */
  onStoppedNotification: ((notification: ObservableNotification<any>, subscriber: Subscriber<any>) => void) | null;

  /**
   * The promise constructor used by default for methods such as
   * {@link Observable/toPromise} and {@link Observable/forEach}
   *
   * @deprecated remove in v8. RxJS will no longer support this sort of injection of a
   * Promise constructor. If you need a Promise implementation other than native promises,
   * please polyfill/patch Promises as you see appropriate.
   */
  Promise: PromiseConstructorLike | undefined;

  /**
   * If true, turns on synchronous error rethrowing, which is a deprecated behavior
   * in v6 and higher. This behavior enables bad patterns like wrapping a subscribe
   * call in a try/catch block. It also enables producer interference, a nasty bug
   * where a multicast can be broken for all observers by a downstream consumer with
   * an unhandled error. DO NOT USE THIS FLAG UNLESS IT'S NEEDED TO BUY TIME
   * FOR MIGRATION REASONS.
   *
   * @deprecated remove in v8. As of version 8, RxJS will no longer support synchronous throwing
   * of unhandled errors. All errors will be thrown on a separate call stack to prevent bad
   * behaviors described above.
   */
  useDeprecatedSynchronousErrorHandling: boolean;

  /**
   * If true, enables an as-of-yet undocumented feature from v5: The ability to access
   * `unsubscribe()` via `this` context in `next` functions created in observers passed
   * to `subscribe`.
   *
   * This is being removed because the performance was severely problematic, and it could also cause
   * issues when types other than POJOs are passed to subscribe as subscribers, as they will likely have
   * their `this` context overwritten.
   *
   * @deprecated remove in v8. As of version 8, RxJS will no longer support altering the
   * context of next functions provided as part of an observer to Subscribe. Instead,
   * you will have access to a subscription or a signal or token that will allow you to do things like
   * unsubscribe and test closed status.
   */
  useDeprecatedNextContext: boolean;
}
