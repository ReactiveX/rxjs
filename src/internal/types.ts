import { Observable } from './Observable';
import { Subscription } from './Subscription';

/** OPERATOR INTERFACES */

export interface UnaryFunction<T, R> { (source: T): R; }

export interface OperatorFunction<T, R, Ts extends T[] = T[], Rs extends R[] = R[]> extends UnaryFunction<Observable<T, Ts>, Observable<R, Rs>> {}

export type FactoryOrValue<T> = T | (() => T);

export interface MonoTypeOperatorFunction<T, Ts extends T[] = T[]> extends OperatorFunction<T, T, Ts, Ts> {}

export interface Timestamp<T> {
  value: T;
  timestamp: number;
}

export interface TimeInterval<T> {
  value: T;
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

export type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T> | Iterable<T>;

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

export interface SchedulerLike {
  now(): number;
  schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
}
export interface SchedulerAction<T> extends Subscription {
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

/** Tuple manipulation types. */

export type SpecificNumber<N extends number> = number extends N ? never : N;
export type IsSpecificNumber<N extends number> = SpecificNumber<N> extends never ? false : true;
export type IsTuple<T extends any[]> = IsSpecificNumber<T['length']>;

type Fn<Args extends any[]> = (...args: Args) => any;
type ExtractFromArray<T extends any[]> = T extends Array<infer U> ? U : never;

export type First<T extends any[]> = T[0];
export type Rest<T extends any[]> = Fn<T> extends ((first: any, ...rest: infer R) => any) ? R : never;

export type Prepend<U, T extends any[]> = ((u: U, ...t: T) => any) extends Fn<infer Pushed> ? Pushed : never;

export type MakeTuple<T, Size extends number> =
  Size extends  0 ? [] :
  Size extends  1 ? [T] :
  Size extends  2 ? [T, T] :
  Size extends  3 ? [T, T, T] :
  Size extends  4 ? [T, T, T, T] :
  Size extends  5 ? [T, T, T, T, T] :
  Size extends  6 ? [T, T, T, T, T, T] :
  Size extends  7 ? [T, T, T, T, T, T, T] :
  Size extends  8 ? [T, T, T, T, T, T, T, T] :
  Size extends  9 ? [T, T, T, T, T, T, T, T, T] :
  Size extends 10 ? [T, T, T, T, T, T, T, T, T, T] :
  T[];

export type Take<T extends any[], N extends number> =
  IsTuple<T> extends false ? MakeTuple<ExtractFromArray<T>, N> :
  Drop<T, N> extends [] ? T : // if taking more than T['length'] just return T;
  N extends  0 ? [] :
  N extends  1 ? [T[0]] :
  N extends  2 ? [T[0], T[1]] :
  N extends  3 ? [T[0], T[1], T[2]] :
  N extends  4 ? [T[0], T[1], T[2], T[3]] :
  N extends  5 ? [T[0], T[1], T[2], T[3], T[4]] :
  N extends  6 ? [T[0], T[1], T[2], T[3], T[4], T[5]] :
  N extends  7 ? [T[0], T[1], T[2], T[3], T[4], T[5], T[6]] :
  N extends  8 ? [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7]] :
  N extends  9 ? [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], T[8]] :
  N extends 10 ? [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], T[8], T[9]] :
  T[number][];

/* tslint:disable:max-line-length */
export type Drop<T extends any[], N extends number> =
  IsTuple<T> extends false ? T :
  N extends  0 ? T :
  N extends  1 ? Fn<T> extends ((a: any, ...rest: infer R) => any) ? R : never :
  N extends  2 ? Fn<T> extends ((a: any, b: any, ...rest: infer R) => any) ? R : never :
  N extends  3 ? Fn<T> extends ((a: any, b: any, c: any, ...rest: infer R) => any) ? R : never :
  N extends  4 ? Fn<T> extends ((a: any, b: any, c: any, d: any, ...rest: infer R) => any) ? R : never :
  N extends  5 ? Fn<T> extends ((a: any, b: any, c: any, d: any, e: any, ...rest: infer R) => any) ? R : never :
  N extends  6 ? Fn<T> extends ((a: any, b: any, c: any, d: any, e: any, f: any, ...rest: infer R) => any) ? R : never :
  N extends  7 ? Fn<T> extends ((a: any, b: any, c: any, d: any, e: any, f: any, g: any, ...rest: infer R) => any) ? R : never :
  N extends  8 ? Fn<T> extends ((a: any, b: any, c: any, d: any, e: any, f: any, g: any, h: any, ...rest: infer R) => any) ? R : never :
  N extends  9 ? Fn<T> extends ((a: any, b: any, c: any, d: any, e: any, f: any, g: any, h: any, i: any, ...rest: infer R) => any) ? R : never :
  N extends 10 ? Fn<T> extends ((a: any, b: any, c: any, d: any, e: any, f: any, g: any, h: any, i: any, j: any, ...rest: infer R) => any) ? R : never :
  T[number][];

export type Slice<T extends any[], StartIndex extends number, EndIndex extends number> =
  IsTuple<T> extends false ? T : Take<Drop<T, StartIndex>, EndIndex>;

export type Concat<T extends any[], U extends any[]> =
  IsTuple<T> extends false ? (T[number]|U[number])[] :
  T['length'] extends  0 ? U :
  T['length'] extends  1 ? ((t0: T[0], ...us: U) => any) extends Fn<infer C> ? C : never :
  T['length'] extends  2 ? ((t0: T[0], t1: T[1], ...us: U) => any) extends Fn<infer C> ? C : never :
  T['length'] extends  3 ? ((t0: T[0], t1: T[1], t2: T[2], ...us: U) => any) extends Fn<infer C> ? C : never :
  T['length'] extends  4 ? ((t0: T[0], t1: T[1], t2: T[2], t3: T[3], ...us: U) => any) extends Fn<infer C> ? C : never :
  T['length'] extends  5 ? ((t0: T[0], t1: T[1], t2: T[2], t3: T[3], t4: T[4], ...us: U) => any) extends Fn<infer C> ? C : never :
  T['length'] extends  6 ? ((t0: T[0], t1: T[1], t2: T[2], t3: T[3], t4: T[4], t5: T[5], ...us: U) => any) extends Fn<infer C> ? C : never :
  T['length'] extends  7 ? ((t0: T[0], t1: T[1], t2: T[2], t3: T[3], t4: T[4], t5: T[5], t6: T[6], ...us: U) => any) extends Fn<infer C> ? C : never :
  T['length'] extends  8 ? ((t0: T[0], t1: T[1], t2: T[2], t3: T[3], t4: T[4], t5: T[5], t6: T[6], t7: T[7], ...us: U) => any) extends Fn<infer C> ? C : never :
  T['length'] extends  9 ? ((t0: T[0], t1: T[1], t2: T[2], t3: T[3], t4: T[4], t5: T[5], t6: T[6], t7: T[7], t8: T[8], ...us: U) => any) extends Fn<infer C> ? C : never :
  T['length'] extends 10 ? ((t0: T[0], t1: T[1], t2: T[2], t3: T[3], t4: T[4], t5: T[5], t6: T[6], t7: T[7], t8: T[8], t9: T[9], ...us: U) => any) extends Fn<infer C> ? C : never :
  (T[number]|U[number])[];
/* tslint:enable:max-line-length */

export type Remove<T extends any[], N extends number> =
  IsTuple<T> extends false ? T :
  Concat<
    Take<T, N>,
    Drop<
      Drop<T, N>,
      1
    >
  >;

export type LessThan<N extends number> =
  IsSpecificNumber<N> extends false ? number :
  N extends  0 ? never :
  N extends  1 ? 0 :
  N extends  2 ? 0|1 :
  N extends  3 ? 0|1|2 :
  N extends  4 ? 0|1|2|3 :
  N extends  5 ? 0|1|2|3|4 :
  N extends  6 ? 0|1|2|3|4|5 :
  N extends  7 ? 0|1|2|3|4|5|6 :
  N extends  8 ? 0|1|2|3|4|5|6|7 :
  N extends  9 ? 0|1|2|3|4|5|6|7|8 :
  N extends 10 ? 0|1|2|3|4|5|6|7|8|9 :
  number;

export type LessThanOrEqual<N extends number> =
  IsSpecificNumber<N> extends false ? number :
  N extends  0 ? 0 :
  N extends  1 ? 0|1 :
  N extends  2 ? 0|1|2 :
  N extends  3 ? 0|1|2|3 :
  N extends  4 ? 0|1|2|3|4 :
  N extends  5 ? 0|1|2|3|4|5 :
  N extends  6 ? 0|1|2|3|4|5|6 :
  N extends  7 ? 0|1|2|3|4|5|6|7 :
  N extends  8 ? 0|1|2|3|4|5|6|7|8 :
  N extends  9 ? 0|1|2|3|4|5|6|7|8|9 :
  N extends 10 ? 0|1|2|3|4|5|6|7|8|9|10 :
  number;
