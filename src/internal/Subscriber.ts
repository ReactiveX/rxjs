import { isFunction } from './util/isFunction';
import { empty as emptyObserver } from './Observer';
import { Observer, PartialObserver } from './types';
import { Subscription, isSubscription } from './Subscription';
import { config } from './config';
import { hostReportError } from './util/hostReportError';

/**
 * Implements the {@link Observer} interface and extends the
 * {@link Subscription} class. While the {@link Observer} is the public API for
 * consuming the values of an {@link Observable}, all Observers get converted to
 * a Subscriber, in order to provide Subscription-like capabilities such as
 * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
 * implementing operators, but it is rarely used as a public API.
 *
 * @class Subscriber<T>
 */
export class Subscriber<T> extends Subscription implements Observer<T> {
  /**
   * A static factory for a Subscriber, given a (potentially partial) definition
   * of an Observer.
   * @param {function(x: ?T): void} [next] The `next` callback of an Observer.
   * @param {function(e: ?any): void} [error] The `error` callback of an
   * Observer.
   * @param {function(): void} [complete] The `complete` callback of an
   * Observer.
   * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)
   * Observer represented by the given arguments.
   * @nocollapse
   */
  static create<T>(next?: (x?: T) => void,
                   error?: (e?: any) => void,
                   complete?: () => void): Subscriber<T> {
    const subscriber = new Subscriber(next, error, complete);
    subscriber.syncErrorThrowable = false;
    return subscriber;
  }

  /** @internal */ syncErrorValue: any = null;
  /** @internal */ syncErrorThrown: boolean = false;
  /** @internal */ syncErrorThrowable: boolean = false;

  protected isStopped: boolean = false;
  protected destination: Observer<any> | Subscriber<any>; // this `any` is the escape hatch to erase extra type param (e.g. R)

  /**
   * @param {Observer|function(value: T): void} [destinationOrNext] A partially
   * defined Observer or a `next` callback function.
   * @param {function(e: ?any): void} [error] The `error` callback of an
   * Observer.
   * @param {function(): void} [complete] The `complete` callback of an
   * Observer.
   */
  constructor(destinationOrNext?: PartialObserver<any> | ((value: T) => void) | null,
              error?: ((e?: any) => void) | null,
              complete?: (() => void) | null) {
    super();

    switch (arguments.length) {
      case 0:
        this.destination = emptyObserver;
        break;
      case 1:
        if (!destinationOrNext) {
          this.destination = emptyObserver;
          break;
        }
        if (typeof destinationOrNext === 'object') {
          if (destinationOrNext instanceof Subscriber) {
            this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
            this.destination = destinationOrNext;
            destinationOrNext.add(this);
          } else {
            this.syncErrorThrowable = true;
            this.destination = new SafeSubscriber<T>(this, <PartialObserver<any>> destinationOrNext);
          }
          break;
        }
      default:
        this.syncErrorThrowable = true;
        this.destination = new SafeSubscriber<T>(this, <((value: T) => void)> destinationOrNext, error, complete);
        break;
    }
  }

  /**
   * The {@link Observer} callback to receive notifications of type `next` from
   * the Observable, with a value. The Observable may call this method 0 or more
   * times.
   * @param {T} [value] The `next` value.
   * @return {void}
   */
  next(value?: T): void {
    if (!this.isStopped) {
      this._next(value!);
    }
  }

  /**
   * The {@link Observer} callback to receive notifications of type `error` from
   * the Observable, with an attached `Error`. Notifies the Observer that
   * the Observable has experienced an error condition.
   * @param {any} [err] The `error` exception.
   * @return {void}
   */
  error(err?: any): void {
    if (!this.isStopped) {
      this.isStopped = true;
      this._error(err);
    }
  }

  /**
   * The {@link Observer} callback to receive a valueless notification of type
   * `complete` from the Observable. Notifies the Observer that the Observable
   * has finished sending push-based notifications.
   * @return {void}
   */
  complete(): void {
    if (!this.isStopped) {
      this.isStopped = true;
      this._complete();
    }
  }

  unsubscribe(): void {
    if (!this.closed) {
      this.isStopped = true;
      super.unsubscribe();
    }
  }

  protected _next(value: T): void {
    this.destination.next(value);
  }

  protected _error(err: any): void {
    this.destination.error(err);
    this.unsubscribe();
  }

  protected _complete(): void {
    this.destination.complete();
    this.unsubscribe();
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class SafeSubscriber<T> extends Subscriber<T> {

  constructor(private _parentSubscriber: Subscriber<T>,
              observerOrNext?: PartialObserver<T> | ((value: T) => void) | null,
              error?: ((e?: any) => void) | null,
              complete?: (() => void) | null) {
    super();
    let next: ((value: T) => void) | undefined;

    if (isFunction(observerOrNext)) {
      next = observerOrNext;
    } else if (observerOrNext) {
      next = observerOrNext.next;
      error = observerOrNext.error;
      complete = observerOrNext.complete;
      if (observerOrNext !== emptyObserver) {
        let context: any;
        if (config.useDeprecatedNextContext) {
          context = Object.create(observerOrNext);
          context.unsubscribe = this.unsubscribe.bind(this);
        } else {
          context = observerOrNext;
        }
        next = next && next.bind(context);
        error = error && error.bind(context);
        complete = complete && complete.bind(context);
        if (isSubscription(observerOrNext)) {
          observerOrNext.add(this.unsubscribe.bind(this));
        }
      }
    }

    this._next = next!;
    this._error = error!;
    this._complete = complete!;
  }

  next(value: T): void {
    if (!this.isStopped && this._next) {
      try {
        this._next(value);
      } catch (err) {
        this._throw(err);
      }
    }
  }

  error(err: any): void {
    if (!this.isStopped) {
      if (this._error) {
        try {
          this._error(err);
        } catch (err) {
          this._throw(err);
          return;
        }
        this.unsubscribe();
      } else {
        this._throw(err);
      }
    }
  }

  private _throw(err: any) {
    this.unsubscribe();
    if (config.useDeprecatedSynchronousErrorHandling) {
      const { _parentSubscriber } = this;
      if (_parentSubscriber?.syncErrorThrowable) {
        _parentSubscriber.syncErrorValue = err;
        _parentSubscriber.syncErrorThrown = true;
      } else {
        throw err;
      }
    } else {
      hostReportError(err);
    }
  }

  complete(): void {
    if (!this.isStopped) {
      if (this._complete) {
        try {
          this._complete();
        } catch (err) {
          this._throw(err);
          return;
        }
      }
      this.unsubscribe();
    }
  }

  unsubscribe() {
    if (!this.closed) {
      const { _parentSubscriber } = this;
      this._parentSubscriber = null!;
      _parentSubscriber.unsubscribe();
      super.unsubscribe();
    }
  }
}
