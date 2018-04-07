export const enum FOType {
  SUBSCRIBE = 0,
  NEXT = 1,
  ERROR = 2,
  COMPLETE = 3,
}

export const enum FSubType {
  UNSUB = 0,
  ADD = 1,
  REMOVE = 2,
  CHECK = 3,
}

export interface FScheduler {
  (): number;
  (work: () => void, delay: number, subs: FSub): number;
}

export type FOArg<T> = FObs<T> | T | any | void;

export interface FSub {
  (type?: FSubType, handler?: () => void): boolean;
  /**
   * Unsubscribes. Always returns true
   */
  (): boolean;
  /**
   * Registers a handler for teardown on unsubscribe
   * returns true or false if everything is already unsubscribed.
   */
  (type: FSubType.ADD, handler: () => void): boolean;
  /**
   * Unegisters a handler from teardown on unsubscribe
   * returns true or false if everything is already unsubscribed.
   */
  (type: FSubType.REMOVE, handler: () => void): boolean;
  /**
   * Returns true if unsubscribed, otherwise false.
   */
  (type: FSubType.CHECK): boolean;
}

export interface FObs<T> {
  /** Subscribes to a Functional Observable with the given sink */
  (type: FOType.SUBSCRIBE, sink: FObs<T>, subscription: FSub): void;
  /** Nexts a value to the sink */
  (type: FOType.NEXT, value: T, subscription: FSub): void;
  /** Sends an error to the sink */
  (type: FOType.ERROR, err: any, subscription: FSub): void;
  /** Sends a completion to the sink */
  (type: FOType.COMPLETE, _: void, subscription: FSub): void;
  (type: FOType, arg: FOArg<T>, subscription: FSub): void;
}

export type Operation<T, R> = (source: FObs<T>) => FObs<R>;

export interface Subscriber<T> {
  next(value: T): void;
  error(err: any): void;
  complete(): void;
  readonly closed: boolean;
}

export interface NextObserver<T> {
  next: (value: T, subscription?: SubscriptionLike) => void;
  error?: (err: any) => void;
  complete?: () => void;
}

export interface ErrorObserver<T> {
  next?: (value: T, subscription?: SubscriptionLike) => void;
  error: (err: any) => void;
  complete?: () => void;
}

export interface CompleteObserver<T> {
  next?: (value: T, subscription?: SubscriptionLike) => void;
  error: (err: any) => void;
  complete?: () => void;
}

export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompleteObserver<T>;

export interface Observer<T> {
  next(value: T, subscription?: SubscriptionLike);
  error(err: any): void;
  complete(): void;
}

export interface SubscriptionLike {
  unsubscribe(): void;
}

export type Teardown = SubscriptionLike | (() => void) | void;