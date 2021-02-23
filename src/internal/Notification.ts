import { PartialObserver, ObservableNotification, CompleteNotification, NextNotification, ErrorNotification } from './types';
import { Observable } from './Observable.js';
import { EMPTY } from './observable/empty.js';
import { of } from './observable/of.js';
import { throwError } from './observable/throwError.js';
import { isFunction } from './util/isFunction.js';

// TODO: When this enum is removed, replace it with a type alias. See #4556.
/**
 * @deprecated NotificationKind is deprecated as const enums are not compatible with isolated modules. Use a string literal instead.
 */
export enum NotificationKind {
  NEXT = 'N',
  ERROR = 'E',
  COMPLETE = 'C',
}

/**
 * Represents a push-based event or value that an {@link Observable} can emit.
 * This class is particularly useful for operators that manage notifications,
 * like {@link materialize}, {@link dematerialize}, {@link observeOn}, and
 * others. Besides wrapping the actual delivered value, it also annotates it
 * with metadata of, for instance, what type of push message it is (`next`,
 * `error`, or `complete`).
 *
 * @see {@link materialize}
 * @see {@link dematerialize}
 * @see {@link observeOn}
 * @deprecated remove in v8. It is NOT recommended to create instances of `Notification` directly
 * and use them. Rather, try to create POJOs matching the signature outlined in {@link ObservableNotification}.
 * For example: `{ kind: 'N', value: 1 }`, `{kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
 */
export class Notification<T> {
  /**
   * A value signifying that the notification will "next" if observed. In truth,
   * This is really synonomous with just checking `kind === "N"`.
   * @deprecated remove in v8. Instead, just check to see if the value of `kind` is `"N"`.
   */
  readonly hasValue: boolean;

  /**
   * Creates a "Next" notification object.
   * @param kind Always `'N'`
   * @param value The value to notify with if observed.
   * @deprecated internal as of v8. Use {@link createNext} instead.
   */
  constructor(kind: 'N', value?: T);
  /**
   * Creates an "Error" notification object.
   * @param kind Always `'E'`
   * @param value Always `undefined`
   * @param error The error to notify with if observed.
   * @deprecated internal as of v8. Use {@link createError} instead.
   */
  constructor(kind: 'E', value: undefined, error: any);
  /**
   * Creates a "completion" notification object.
   * @param kind Always `'C'`
   * @deprecated internal as of v8. Use {@link createComplete} instead.
   */
  constructor(kind: 'C');
  constructor(public readonly kind: 'N' | 'E' | 'C', public readonly value?: T, public readonly error?: any) {
    this.hasValue = kind === 'N';
  }

  /**
   * Executes the appropriate handler on a passed `observer` given the `kind` of notification.
   * If the handler is missing it will do nothing. Even if the notification is an error, if
   * there is no error handler on the observer, an error will not be thrown, it will noop.
   * @param observer The observer to notify.
   */
  observe(observer: PartialObserver<T>): void {
    return observeNotification(this as ObservableNotification<T>, observer);
  }

  /**
   * Executes a notification on the appropriate handler from a list provided.
   * If a handler is missing for the kind of notification, nothing is called
   * and no error is thrown, it will be a noop.
   * @param next A next handler
   * @param error An error handler
   * @param complete A complete handler
   * @deprecated remove in v8. use {@link Notification.prototype.observe} instead.
   */
  do(next: (value: T) => void, error: (err: any) => void, complete: () => void): void;
  /**
   * Executes a notification on the appropriate handler from a list provided.
   * If a handler is missing for the kind of notification, nothing is called
   * and no error is thrown, it will be a noop.
   * @param next A next handler
   * @param error An error handler
   * @deprecated remove in v8. use {@link Notification.prototype.observe} instead.
   */
  do(next: (value: T) => void, error: (err: any) => void): void;
  /**
   * Executes the next handler if the Notification is of `kind` `"N"`. Otherwise
   * this will not error, and it will be a noop.
   * @param next The next handler
   * @deprecated remove in v8. use {@link Notification.prototype.observe} instead.
   */
  do(next: (value: T) => void): void;
  do(nextHandler: (value: T) => void, errorHandler?: (err: any) => void, completeHandler?: () => void): void {
    const { kind, value, error } = this;
    return kind === 'N' ? nextHandler?.(value!) : kind === 'E' ? errorHandler?.(error) : completeHandler?.();
  }

  /**
   * Executes a notification on the appropriate handler from a list provided.
   * If a handler is missing for the kind of notification, nothing is called
   * and no error is thrown, it will be a noop.
   * @param next A next handler
   * @param error An error handler
   * @param complete A complete handler
   * @deprecated remove in v8. use {@link Notification.prototype.observe} instead.
   */
  accept(next: (value: T) => void, error: (err: any) => void, complete: () => void): void;
  /**
   * Executes a notification on the appropriate handler from a list provided.
   * If a handler is missing for the kind of notification, nothing is called
   * and no error is thrown, it will be a noop.
   * @param next A next handler
   * @param error An error handler
   * @deprecated remove in v8. use {@link Notification.prototype.observe} instead.
   */
  accept(next: (value: T) => void, error: (err: any) => void): void;
  /**
   * Executes the next handler if the Notification is of `kind` `"N"`. Otherwise
   * this will not error, and it will be a noop.
   * @param next The next handler
   * @deprecated remove in v8. use {@link Notification.prototype.observe} instead.
   */
  accept(next: (value: T) => void): void;

  /**
   * Executes the appropriate handler on a passed `observer` given the `kind` of notification.
   * If the handler is missing it will do nothing. Even if the notification is an error, if
   * there is no error handler on the observer, an error will not be thrown, it will noop.
   * @param observer The observer to notify.
   * @deprecated remove in v8. Use {@link Notification.prototype.observe} instead.
   */
  accept(observer: PartialObserver<T>): void;
  accept(nextOrObserver: PartialObserver<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void) {
    return isFunction((nextOrObserver as any)?.next)
      ? this.observe(nextOrObserver as PartialObserver<T>)
      : this.do(nextOrObserver as (value: T) => void, error as any, complete as any);
  }

  /**
   * Returns a simple Observable that just delivers the notification represented
   * by this Notification instance.
   *
   * @deprecated remove in v8. In order to accomplish converting `Notification` to an {@link Observable}
   * you may use {@link of} and {@link dematerialize}: `of(notification).pipe(dematerialize())`. This is
   * being removed as it has limited usefulness, and we're trying to streamline the library.
   */
  toObservable(): Observable<T> {
    const { kind, value, error } = this;
    // Select the observable to return by `kind`
    const result =
      kind === 'N'
        ? // Next kind. Return an observable of that value.
          of(value!)
        : //
        kind === 'E'
        ? // Error kind. Return an observable that emits the error.
          throwError(error)
        : //
        kind === 'C'
        ? // Completion kind. Kind is "C", return an observable that just completes.
          EMPTY
        : // Unknown kind, return falsy, so we error below.
          0;
    if (!result) {
      // TODO: consider removing this check. The only way to cause this would be to
      // use the Notification constructor directly in a way that is not type-safe.
      // and direct use of the Notification constructor is deprecated.
      throw new TypeError(`Unexpected notification kind ${kind}`);
    }
    return result;
  }

  private static completeNotification = new Notification('C') as Notification<never> & CompleteNotification;
  /**
   * A shortcut to create a Notification instance of the type `next` from a
   * given value.
   * @param {T} value The `next` value.
   * @return {Notification<T>} The "next" Notification representing the
   * argument.
   * @nocollapse
   * @deprecated remove in v8. It is NOT recommended to create instances of `Notification` directly
   * and use them. Rather, try to create POJOs matching the signature outlined in {@link ObservableNotification}.
   * For example: `{ kind: 'N', value: 1 }`, `{kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
   */
  static createNext<T>(value: T) {
    return new Notification('N', value) as Notification<T> & NextNotification<T>;
  }

  /**
   * A shortcut to create a Notification instance of the type `error` from a
   * given error.
   * @param {any} [err] The `error` error.
   * @return {Notification<T>} The "error" Notification representing the
   * argument.
   * @nocollapse
   * @deprecated remove in v8. It is NOT recommended to create instances of `Notification` directly
   * and use them. Rather, try to create POJOs matching the signature outlined in {@link ObservableNotification}.
   * For example: `{ kind: 'N', value: 1 }`, `{kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
   */
  static createError(err?: any) {
    return new Notification('E', undefined, err) as Notification<never> & ErrorNotification;
  }

  /**
   * A shortcut to create a Notification instance of the type `complete`.
   * @return {Notification<any>} The valueless "complete" Notification.
   * @nocollapse
   * @deprecated remove in v8. It is NOT recommended to create instances of `Notification` directly
   * and use them. Rather, try to create POJOs matching the signature outlined in {@link ObservableNotification}.
   * For example: `{ kind: 'N', value: 1 }`, `{kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
   */
  static createComplete(): Notification<never> & CompleteNotification {
    return Notification.completeNotification;
  }
}

/**
 * Executes the appropriate handler on a passed `observer` given the `kind` of notification.
 * If the handler is missing it will do nothing. Even if the notification is an error, if
 * there is no error handler on the observer, an error will not be thrown, it will noop.
 * @param notification The notification object to observe.
 * @param observer The observer to notify.
 */
export function observeNotification<T>(notification: ObservableNotification<T>, observer: PartialObserver<T>) {
  const { kind, value, error } = notification as any;
  if (typeof kind !== 'string') {
    throw new TypeError('Invalid notification, missing "kind"');
  }
  kind === 'N' ? observer.next?.(value!) : kind === 'E' ? observer.error?.(error) : observer.complete?.();
}
