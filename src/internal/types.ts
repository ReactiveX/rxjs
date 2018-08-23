import { Subscription } from './Subscription';
import { Observable } from './Observable';

export enum FOType {
  SUBSCRIBE = 0,
  NEXT = 1,
  COMPLETE = 2,
  ERROR = 3,
}

export type SinkArg<T> = T | void | any;

export interface Sink<T> {
  (type: FOType.NEXT, value: T, subs: Subscription): void;
  (type: FOType.ERROR, err: any, subs: Subscription): void;
  (type: FOType.COMPLETE, arg: void, subs: Subscription): void;
  (type: FOType, arg: FObsArg<T>, subs: Subscription): void;
}

export interface Source<T> {
  (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription): void;
}

export interface FObs<T> extends Source<T>, Sink<T> {
  (type: FOType, arg: FObsArg<T>, subs: Subscription): void;
}

export type FObsArg<T> = SinkArg<T> | void;

export type Teardown = SubscriptionLike | (() => void) | void;

export interface NextObserver<T> {
  next: (value: T, subscription: Subscription) => void;
  error?: (err: any) => void;
  complete?: () => void;
  [key: string]: any;
}

export interface ErrorObserver<T> {
  next?: (value: T, subscription: Subscription) => void;
  error: (err: any) => void;
  complete?: () => void;
  [key: string]: any;
}

export interface CompleteObserver<T> {
  next?: (value: T, subscription: Subscription) => void;
  error?: (err: any) => void;
  complete: () => void;
  [key: string]: any;
}

export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompleteObserver<T>;

export interface Observer<T> {
  next: (value: T, subscription?: Subscription) => void;
  error: (err: any) => void;
  complete: () => void;
  [key: string]: any;
}

export interface SchedulerLike {
  now(): number;
  schedule<T>(work: () => void): Subscription;
  schedule<T>(work: () => void, delay: number): Subscription;
  schedule<T>(work: (state?: T) => void, delay: number, state: T): Subscription;
  schedule<T>(work: (state?: T) => void, delay: number, state: T, subs: Subscription): Subscription;
}

export type Operation<T, R> = (source: Observable<T>) => Observable<R>;

export interface ObservableLike<T> {
  subscribe(observer: Observer<T>): SubscriptionLike;
}

export interface InteropObservable<T> {
  [Symbol.observable](): ObservableLike<T>;
}

export type ObservableInput<T> = Observable<T> | ObservableLike<T> | PromiseLike<T> |
  Array<T> | ArrayLike<T> | InteropObservable<T> | AsyncIterable<T> | Iterable<T>;

export interface SubscriptionLike {
  unsubscribe(): void;
}

export interface GroupedObservable<K, T> extends Observable<T> {
  readonly key: K;
}

export interface NextNotification<T> {
  kind: 'N';
  value: T;
}

export interface ErrorNotification {
  kind: 'E';
  error: any;
}

export interface CompleteNotification {
  kind: 'C';
}

export interface SubscribeNotification {
  kind: 'S';
}

export interface UnsubscribeNotification {
  kind: 'S';
}

export type Notification<T> = NextNotification<T> | ErrorNotification | CompleteNotification |
  SubscribeNotification | UnsubscribeNotification;

export interface Timestamped<T> {
  value: T,
  timestamp: number;
}

declare global  {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}
