import { Subscription } from './Subscription';

export enum FOType {
  SUBSCRIBE = 0,
  NEXT = 1,
  COMPLETE = 2,
  ERROR = 10
}

export interface Subs {
  (type: FOType.COMPLETE, arg: void): void;
}

export type SinkArg<T> = T | void | any;

export interface Sink<T> {
  (type: FOType.SUBSCRIBE, subscription: Subs): void;
  (type: FOType.NEXT, value: T): void;
  (type: FOType.ERROR, err: any): void;
  (type: FOType.COMPLETE, arg: void): void;
}

export interface Source<T> {
  (type: FOType.SUBSCRIBE, sink: Sink<T>): void;
}

export interface FObs<T> extends Source<T>, Sink<T>, Subs {}

export type Teardown = Subscription | (() => void) | void;

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
  next: (value: T, subscription: Subscription) => void;
  error: (err: any) => void;
  complete: () => void;
}
