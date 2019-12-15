import { Observable } from './Observable';
import { Subscription } from './Subscription';

/** OPERATOR INTERFACES */

export type UnaryFunction<T, R> = (source: T) => R;

export type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;

export type FactoryOrValue<T> = T | (() => T);

/**
 * @deprecated use `OperatorFunction`
 */
export type MonoTypeOperatorFunction<T> = (source: Observable<T>) => Observable<T>;

/**
 * @deprecated use `ITimestamp`
 */
export type Timestamp<T> = ITimestamp<T>;

export interface ITimestamp<T> {
  value: T;
  timestamp: number;
}

/**
 * @deprecated use `ITimeInterval`
 */
export type TimeInterval<T> = ITimeInterval<T>;

export interface ITimeInterval<T> {
  value: T;
  interval: number;
}

/** SUBSCRIPTION INTERFACES */

/**
 * @deprecated use `IUnsubscribable`
 */
export type Unsubscribable = IUnsubscribable;

export interface IUnsubscribable {
  unsubscribe(): void;
}

export type TeardownLogic = IUnsubscribable | Function | void;

/**
 * @deprecated use `ISubscriptionLike`
 */
export type SubscriptionLike = ISubscriptionLike;

export interface ISubscriptionLike extends IUnsubscribable {
  unsubscribe(): void;
  readonly closed: boolean;
}

export type SubscribableOrPromise<T> = ISubscribable<T> | ISubscribable<never> | PromiseLike<T> | InteropObservable<T>;

/** OBSERVABLE INTERFACES */

/**
 * @deprecated use ISubscribable
 */
export type Subscribable<T> = ISubscribable<T>;

export interface ISubscribable<T> {
  subscribe(): IUnsubscribable;
  subscribe(observer: IPartialObserver<T>): IUnsubscribable;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: null | undefined, error: null | undefined, complete: () => void): IUnsubscribable;
  /** @deprecated Use an observer instead of an error callback */
  subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): IUnsubscribable;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: (value: T) => void, error: null | undefined, complete: () => void): IUnsubscribable;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): IUnsubscribable;
}

export type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T> | Iterable<T>;

/** @deprecated use {@link InteropObservable } */
export type ObservableLike<T> = InteropObservable<T>;

export type InteropObservable<T> = { [Symbol.observable]: () => ISubscribable<T>; };

/** OBSERVER INTERFACES */

/**
 * @deprecated do not use
 */
export interface NextObserver<T> {
  closed?: boolean;
  next: (value: T) => void;
  error?: (err: any) => void;
  complete?: () => void;
}

/**
 * @deprecated do not use
 */
export interface ErrorObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error: (err: any) => void;
  complete?: () => void;
}

/**
 * @deprecated do not use
 */
export interface CompletionObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error?: (err: any) => void;
  complete: () => void;
}

/**
 * @deprecated use `IPartialObserver`
 */
export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>;

/**
 * @deprecated use `IObserver`
 */
export interface Observer<T> {
  closed?: boolean;
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

export interface IObserver<T, E = any> {
  next: (value: T) => void;
  error: (err: E) => void;
  complete: () => void;
}

export interface ISubscriber<T, E = any> {
  next(value: T): void;
  error(err: E): void;
  complete(): void;
  readonly closed: boolean;
}

export type IPartialObserver<T, E = any> = Partial<IObserver<T, E>>;

/** SCHEDULER INTERFACES */

/**
 * @deprecated use `ISchedulerLike`
 */
export type SchedulerLike = ISchedulerLike;

export interface ISchedulerLike {
  now(): number;
  schedule<T>(work: (this: ISchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
}

/**
 * @deprecated use `ISchedulerAction`
 */
export type SchedulerAction<T> = ISchedulerAction<T>;

export interface ISchedulerAction<T> extends Subscription {
  schedule(state?: T, delay?: number): Subscription;
}

/**
 * Extracts the type from an `ObservableInput<any>`. If you have
 * `O extends ObservableInput<any>` and you pass in `Observable<number>`, or
 * `Promise<number>`, etc, it will type as `number`.
 */
export type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;

/**
 * Extracts the generic type from an `ObservableInput<any>[]`.
 * If you have `O extends ObservableInput<any>[]` and you pass in
 * `Observable<string>[]` or `Promise<string>[]` you would get
 * back a type of `string`
 */
export type ObservedValuesFromArray<X> = X extends Array<ObservableInput<infer T>> ? T : never;

/**
 * Extracts the generic value from an Array type.
 * If you have `T extends Array<any>`, and pass a `string[]` to it,
 * `ValueFromArray<T>` will return the actual type of `string`.
 */
export type ValueFromArray<A> = A extends Array<infer T> ? T : never;