import {isFunction} from './util/isFunction';
import {Observer} from './Observer';
import {Subscription} from './Subscription';
import {rxSubscriber} from './symbol/rxSubscriber';
import {empty as emptyObserver} from './Observer';

export class Subscriber<T> extends Subscription implements Observer<T> {

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
  protected destination: Observer<any>;

  constructor(destinationOrNext?: Observer<any> | ((value: T) => void),
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
            this.destination = (<Observer<any>> destinationOrNext);
          } else {
            this.syncErrorThrowable = true;
            this.destination = new SafeSubscriber<T>(this, <Observer<any>> destinationOrNext);
          }
          break;
        }
      default:
        this.syncErrorThrowable = true;
        this.destination = new SafeSubscriber<T>(this, <((value: T) => void)> destinationOrNext, error, complete);
        break;
    }
  }

  next(value?: T): void {
    if (!this.isStopped) {
      this._next(value);
    }
  }

  error(err?: any): void {
    if (!this.isStopped) {
      this.isStopped = true;
      this._error(err);
    }
  }

  complete(): void {
    if (!this.isStopped) {
      this.isStopped = true;
      this._complete();
    }
  }

  unsubscribe(): void {
    if (this.isUnsubscribed) {
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

  [rxSubscriber]() {
    return this;
  }
}

class SafeSubscriber<T> extends Subscriber<T> {

  private _context: any;

  constructor(private _parent: Subscriber<T>,
              observerOrNext?: Observer<T> | ((value: T) => void),
              error?: (e?: any) => void,
              complete?: () => void) {
    super();

    let next: ((value: T) => void);
    let context: any = this;

    if (isFunction(observerOrNext)) {
      next = (<((value: T) => void)> observerOrNext);
    } else if (observerOrNext) {
      context = observerOrNext;
      next = (<Observer<T>> observerOrNext).next;
      error = (<Observer<T>> observerOrNext).error;
      complete = (<Observer<T>> observerOrNext).complete;
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
