import { Observable } from './Observable';
import { PartialObserver } from './types';

/** OPERATOR INTERFACES */

export interface UnaryFunction<T, R> { (source: T): R; }

export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> {}

export type FactoryOrValue<T> = T | (() => T);

export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> {}

/** SUBSCRIPTION INTERFACES */

export interface AnonymousSubscription {
  unsubscribe(): void;
}

export type TeardownLogic = AnonymousSubscription | Function | void;

export interface ISubscription extends AnonymousSubscription {
  unsubscribe(): void;
  readonly closed: boolean;
}

export interface Subscribable<T> {
  subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void),
            error?: (error: any) => void,
            complete?: () => void): AnonymousSubscription;
}

export type SubscribableOrPromise<T> = Subscribable<T> | Subscribable<never> | PromiseLike<T> | ObservableLike<T>;

/** OBSERVABLE INTERFACES */

export interface Subscribable<T> {
  subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void),
            error?: (error: any) => void,
            complete?: () => void): AnonymousSubscription;
}

export type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T> | Iterable<T>;
export type ObservableLike<T> = { [Symbol.observable]: () => Subscribable<T>; };

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