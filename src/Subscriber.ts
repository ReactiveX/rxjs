import {isFunction} from './util/isFunction';
import {tryCatch} from './util/tryCatch';
import {errorObject} from './util/errorObject';

import {Observer} from './Observer';
import {Subscription} from './Subscription';
import {rxSubscriber} from './symbol/rxSubscriber';
import {empty as emptyObserver} from './Observer';

export class Subscriber<T> extends Subscription implements Observer<T> {

  static create<T>(next?: (x?: T) => void,
                   error?: (e?: any) => void,
                   complete?: () => void): Subscriber<T> {
    return new Subscriber(next, error, complete);
  }

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
            this.destination = new SafeSubscriber<T>(this, <Observer<any>> destinationOrNext);
          }
          break;
        }
      default:
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
      if (tryCatch(this._next).call(this._context, value) === errorObject) {
        this.unsubscribe();
        throw errorObject.e;
      }
    }
  }

  error(err?: any): void {
    if (!this.isStopped) {
      if (this._error) {
        if (tryCatch(this._error).call(this._context, err) === errorObject) {
          this.unsubscribe();
          throw errorObject.e;
        }
      }
      this.unsubscribe();
    }
  }

  complete(): void {
    if (!this.isStopped) {
      if (this._complete) {
          if (tryCatch(this._complete).call(this._context) === errorObject) {
            this.unsubscribe();
            throw errorObject.e;
          }
      }
      this.unsubscribe();
    }
  }

  protected _unsubscribe(): void {
    const { _parent } = this;
    this._context = null;
    this._parent = null;
    _parent.unsubscribe();
  }
}
