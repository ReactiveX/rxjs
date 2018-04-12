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
}

export interface ErrorObserver<T> {
  next?: (value: T, subscription: Subscription) => void;
  error: (err: any) => void;
  complete?: () => void;
}

export interface CompleteObserver<T> {
  next?: (value: T, subscription: Subscription) => void;
  error?: (err: any) => void;
  complete: () => void;
}

export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompleteObserver<T>;

export interface Observer<T> {
  next: (value: T, subscription?: Subscription) => void;
  error: (err: any) => void;
  complete: () => void;
}

export interface Scheduler {
  (): number;
  (work: () => void, delay: number, subs: Subscription): number;
}

export type Operation<T, R> = (source: Observable<T>) => Observable<R>;

export interface ObservableLike<T> {
  subscribe(observer: Observer<T>): Subscription;
}

export type ObservableInput<T> = Observable<T> | ObservableLike<T> | PromiseLike<T> | Array<T> | ArrayLike<T>;

export interface SubscriptionLike {
  unsubscribe(): void;
}
