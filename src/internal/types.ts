import { Observable } from './Observable';
import { PartialObserver } from './Observer';
import { AnonymousSubscription } from './Subscription';

export interface UnaryFunction<T, R> { (source: T): R; }

export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> {}

export type FactoryOrValue<T> = T | (() => T);

export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> {}

export interface Subscribable<T> {
  subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void),
            error?: (error: any) => void,
            complete?: () => void): AnonymousSubscription;
}

export type ObservableLike<T> = { [Symbol.observable]: () => Subscribable<T>; };
export type SubscribableOrPromise<T> = Subscribable<T> | Subscribable<never> | PromiseLike<T> | ObservableLike<T>;
export type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T> | Iterable<T>;

//TODO(benlesh): eventually we need to move all Observer interfaces to types.ts
export * from './Observer';
