import { behaviorSubject } from './behavior-subject.js';
import type { ConnectableObservable } from './connectable.js';
import { multicast } from './multicast.js';

export const publishBehavior: unique symbol = Symbol('publishBehavior');

declare global {
  interface Observable<T> {
    [publishBehavior](initialValue: T): ConnectableObservable<T>;
  }
}

Observable.prototype[publishBehavior] = function <T>(this: Observable<T>, initialValue: T): ConnectableObservable<T> {
  // RxJS 7 creates one BehaviorSubject per published result and retains that
  // same instance across manual disconnects and terminal notifications.
  return this[multicast](behaviorSubject(initialValue));
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `publishBehavior` form of the exact-Symbol `[publishBehavior]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. Any non-Observable result is returned unchanged.
 *
 * @returns A unary function that applies `[publishBehavior]` to its source.
 */
export function pipeablePublishBehavior<T>(initialValue: T): (source: Observable<T>) => ConnectableObservable<T>;
export function pipeablePublishBehavior(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[publishBehavior] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
