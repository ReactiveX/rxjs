import {noop} from './util/noop';
import {throwError} from './util/throwError';
import {tryOrThrowError} from './util/tryOrThrowError';

import {Observer} from './Observer';
import {Subscription} from './Subscription';
import {rxSubscriber} from './symbol/rxSubscriber';
import {empty as emptyObserver} from './Observer';

export class Subscriber<T> extends Subscription implements Observer<T> {

  static create<T>(next?: (x?: T) => void,
                   error?: (e?: any) => void,
                   complete?: () => void): Subscriber<T> {
    return new SafeSubscriber<T>(next, error, complete);
  }

  protected isStopped: boolean = false;
  protected destination: Observer<any>;

  constructor(destination: Observer<any> = emptyObserver) {
    super();

    this.destination = destination;

    if (!destination ||
        (destination instanceof Subscriber) ||
        (destination === emptyObserver)) {
      return;
    }

    if (typeof destination.next !== 'function') { destination.next = noop; }
    if (typeof destination.error !== 'function') { destination.error = throwError; }
    if (typeof destination.complete !== 'function') { destination.complete = noop; }
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

  constructor(next?: (x?: T) => void,
              error?: (e?: any) => void,
              complete?: () => void) {
    super();
    this._next = (typeof next === 'function') && tryOrThrowError(next) || null;
    this._error = (typeof error === 'function') && tryOrThrowError(error) || throwError;
    this._complete = (typeof complete === 'function') && tryOrThrowError(complete) || null;
  }

  next(value?: T): void {
    if (!this.isStopped && this._next) {
      this._next(value);
    }
  }

  error(err?: any): void {
    if (!this.isStopped) {
      if (this._error) {
        this._error(err);
      }
      this.unsubscribe();
    }
  }

  complete(): void {
    if (!this.isStopped) {
      if (this._complete) {
        this._complete();
      }
      this.unsubscribe();
    }
  }
}
