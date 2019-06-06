import { Subject } from './Subject';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { SubscriptionLike } from './types';
import { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';

/**
 * This subject is the same as {@link Subject}, but it will always emit the most
 * recent value upon subscription. You must supply an initial value for it to emit.
 *
 * This differs from `new ReplaySubject(1)`, in that:
 *
 * 1. `ReplaySubject` will replay values even after it completes or errors.
 * 2. `CurrentValueSubject` accepts an initial value to store.
 *
 * @see {@link Subject}
 * @see {@link ReplaySubject}
 */
export class CurrentValueSubject<T> extends Subject<T> {
  /**
   * Creates an instance of {@link CurrentValueSubject}.
   *
   * @param initialValue The initial value that will be emitted if this subject is
   * subscribed to before any values are nexted into it.
   */
  constructor(initialValue: T) {
    super();
    // NOTE: not using `private initialValue` in constructor because we want to
    // provide a good name in IDEs, but we want to hide private properties with
    // an `_` prefix for plain JavaScript users.
    this._value = initialValue;
  }

  private _value: T;

  /**
   * Gets the current value. Generally, it's better practice so subscribe to get
   * the value, but this is a valid "escape hatch" for when it makes sense, which
   * is generally when the code is shorter or easier to read.
   *
   * If an error has been passed into this subject, calling this getter will
   * throw the error.
   */
  get value(): T {
    if (this.hasError) {
      throw this.thrownError;
    } else if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else {
      return this._value;
    }
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>): Subscription {
    const subscription = super._subscribe(subscriber);
    if (subscription && !(<SubscriptionLike>subscription).closed) {
      subscriber.next(this._value);
    }
    return subscription;
  }

  /** @deprecated remove in v8. Use the `value` property */
  getValue(): T {
    return this.value;
  }

  next(value: T): void {
    super.next(this._value = value);
  }
}

/** @deprecated remove in v8. Use {@link CurrentValueSubject} */
export const BehaviorSubject = CurrentValueSubject;
