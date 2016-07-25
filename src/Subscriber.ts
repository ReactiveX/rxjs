import {isFunction} from './util/isFunction';
import {Observer, PartialObserver} from './Observer';
import {Subscription} from './Subscription';
import {empty as emptyObserver} from './Observer';
import {$$rxSubscriber} from './symbol/rxSubscriber';

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

  [$$rxSubscriber]() { return this; }

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
   */
  static create<T>(next?: (x?: T) => void,
                   error?: (e?: any) => void,
                   complete?: () => void): Subscriber<T> {
    const subscriber = new Subscriber(next, error, complete);
    subscriber.syncErrorThrowable = false;
    return subscriber;
  }

  public syncErrorValue: any = null;
  public syncErrorThrown: boolean = false;
  public syncErrorThrowable: boolean = false;

  protected isStopped: boolean = false;
  protected destination: PartialObserver<any>; // this `any` is the escape hatch to erase extra type param (e.g. R)

  /**
   * @param {Observer|function(value: T): void} [destinationOrNext] A partially
   * defined Observer or a `next` callback function.
   * @param {function(e: ?any): void} [error] The `error` callback of an
   * Observer.
   * @param {function(): void} [complete] The `complete` callback of an
   * Observer.
   */
  constructor(destinationOrNext?: PartialObserver<any> | ((value: T) => void),
              error?: (e?: any) => void,
              complete?: () => void) {
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
            this.destination = (<Subscriber<any>> destinationOrNext);
            (<any> this.destination).add(this);
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
      this._next(value);
    }
  }

  /**
   * The {@link Observer} callback to receive notifications of type `error` from
   * the Observable, with an attached {@link Error}. Notifies the Observer that
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
    if (this.closed) {
      return;
    }
    this.isStopped = true;
    super.unsubscribe();
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
class SafeSubscriber<T> extends Subscriber<T> {

  private _context: any;

  constructor(private _parent: Subscriber<T>,
              observerOrNext?: PartialObserver<T> | ((value: T) => void),
              error?: (e?: any) => void,
              complete?: () => void) {
    super();

    let next: ((value: T) => void);
    let context: any = this;

    if (isFunction(observerOrNext)) {
      next = (<((value: T) => void)> observerOrNext);
    } else if (observerOrNext) {
      context = observerOrNext;
      next = (<PartialObserver<T>> observerOrNext).next;
      error = (<PartialObserver<T>> observerOrNext).error;
      complete = (<PartialObserver<T>> observerOrNext).complete;
      if (isFunction(context.unsubscribe)) {
        this.add(<() => void> context.unsubscribe.bind(context));
      }
      context.unsubscribe = this.unsubscribe.bind(this);
    }

    this._context = context;
    this._next = next;
    this._error = error;
    this._complete = complete;
  }

  next(value?: T): void {
    if (!this.isStopped && this._next) {
      const { _parent } = this;
      if (!_parent.syncErrorThrowable) {
        this.__tryOrUnsub(this._next, value);
      } else if (this.__tryOrSetError(_parent, this._next, value)) {
        this.unsubscribe();
      }
    }
  }

  error(err?: any): void {
    if (!this.isStopped) {
      const { _parent } = this;
      if (this._error) {
        if (!_parent.syncErrorThrowable) {
          this.__tryOrUnsub(this._error, err);
          this.unsubscribe();
        } else {
          this.__tryOrSetError(_parent, this._error, err);
          this.unsubscribe();
        }
      } else if (!_parent.syncErrorThrowable) {
        this.unsubscribe();
        throw err;
      } else {
        _parent.syncErrorValue = err;
        _parent.syncErrorThrown = true;
        this.unsubscribe();
      }
    }
  }

  complete(): void {
    if (!this.isStopped) {
      const { _parent } = this;
      if (this._complete) {
        if (!_parent.syncErrorThrowable) {
          this.__tryOrUnsub(this._complete);
          this.unsubscribe();
        } else {
          this.__tryOrSetError(_parent, this._complete);
          this.unsubscribe();
        }
      } else {
        this.unsubscribe();
      }
    }
  }

  private __tryOrUnsub(fn: Function, value?: any): void {
    try {
      fn.call(this._context, value);
    } catch (err) {
      this.unsubscribe();
      throw err;
    }
  }

  private __tryOrSetError(parent: Subscriber<T>, fn: Function, value?: any): boolean {
    try {
      fn.call(this._context, value);
    } catch (err) {
      parent.syncErrorValue = err;
      parent.syncErrorThrown = true;
      return true;
    }
    return false;
  }

  protected _unsubscribe(): void {
    const { _parent } = this;
    this._context = null;
    this._parent = null;
    _parent.unsubscribe();
  }
}
