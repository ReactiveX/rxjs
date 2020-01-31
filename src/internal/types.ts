import { Observable } from './Observable';
import { Subscription } from './Subscription';

/** OPERATOR INTERFACES */

export interface UnaryFunction<T, R> { (source: T): R; }

export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> {}

export type FactoryOrValue<T> = T | (() => T);

export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> {}

/**
 * A value and the time at which it was emitted.
 *
 * Emitted by the `timestamp` operator
 *
 * {@see timestamp}
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
 * {@see timeInterval}
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

export type TeardownLogic = Unsubscribable | Function | void;

export interface SubscriptionLike extends Unsubscribable {
  unsubscribe(): void;
  readonly closed: boolean;
}

export type SubscribableOrPromise<T> = Subscribable<T> | Subscribable<never> | PromiseLike<T> | InteropObservable<T>;

/** OBSERVABLE INTERFACES */

export interface Subscribable<T> {
  subscribe(observer?: PartialObserver<T>): Unsubscribable;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: null | undefined, error: null | undefined, complete: () => void): Unsubscribable;
  /** @deprecated Use an observer instead of an error callback */
  subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): Unsubscribable;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: (value: T) => void, error: null | undefined, complete: () => void): Unsubscribable;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Unsubscribable;
}

export type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T> | Iterable<T> | AsyncIterableIterator<T>;

/** @deprecated use {@link InteropObservable } */
export type ObservableLike<T> = InteropObservable<T>;

export type InteropObservable<T> = { [Symbol.observable]: () => Subscribable<T>; };

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
  closed?: boolean;
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

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
export type ObservedValueUnionFromArray<X> =
  X extends Array<ObservableInput<infer T>>
    ? T
    : never;

/** @deprecated use {@link ObservedValueUnionFromArray} */
export type ObservedValuesFromArray<X> = ObservedValueUnionFromArray<X>;

/**
 * Extracts a tuple of element types from an `ObservableInput<any>[]`.
 * If you have `O extends ObservableInput<any>[]` and you pass in
 * `[Observable<string>, Observable<number>]` you would get back a type
 * of `[string, number]`.
 */
export type ObservedValueTupleFromArray<X> =
  X extends Array<ObservableInput<any>>
    ? { [K in keyof X]: ObservedValueOf<X[K]> }
    : never;

/**
 * Constructs a new tuple with the specified type at the head.
 * If you declare `Cons<A, [B, C]>` you will get back `[A, B, C]`.
 */
export type Cons<X, Y extends any[]> =
  ((arg: X, ...rest: Y) => any) extends ((...args: infer U) => any)
    ? U
    : never;

/**
 * Extracts the head of a tuple.
 * If you declare `Head<[A, B, C]>` you will get back `A`.
 */
export type Head<X extends any[]> =
  ((...args: X) => any) extends ((arg: infer U, ...rest: any[]) => any)
    ? U
    : never;

/**
 * Extracts the tail of a tuple.
 * If you declare `Tail<[A, B, C]>` you will get back `[B, C]`.
 */
export type Tail<X extends any[]> =
((...args: X) => any) extends ((arg: any, ...rest: infer U) => any)
  ? U
  : never;

/**
 * Extracts the generic value from an Array type.
 * If you have `T extends Array<any>`, and pass a `string[]` to it,
 * `ValueFromArray<T>` will return the actual type of `string`.
 */
export type ValueFromArray<A> = A extends Array<infer T> ? T : never;