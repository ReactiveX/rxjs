import { Subscribable } from './Observable';
import { Subscription } from './Subscription';

export { UnaryFunction, OperatorFunction, FactoryOrValue, MonoTypeOperatorFunction } from './interfaces';

export interface Timestamp<T> {
  value: T;
  timestamp: number;
}

export interface TimeInterval<T> {
  value: T;
  interval: number;
}

/** SUBSCRIPTION & OBSERVABLE INTERFACES */

export { AnonymousSubscription as Unsubscribable, TeardownLogic, ISubscription as SubscriptionLike } from './Subscription';

export { SubscribableOrPromise, ObservableInput } from './Observable';

export { Subscribable };

/** OBSERVER INTERFACES */

export { NextObserver, ErrorObserver, CompletionObserver, PartialObserver, Observer } from './Observer';

/** SCHEDULER INTERFACES */

export { IScheduler as SchedulerLike } from './Scheduler';

export interface SchedulerAction<T> extends Subscription {
  schedule(state?: T, delay?: number): Subscription;
}
