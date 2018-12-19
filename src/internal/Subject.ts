import { Observable } from 'rxjs/internal/Observable';
import { Observer, TeardownLogic } from 'rxjs/internal/types';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { ObjectUnsubscribedError } from 'rxjs/internal/util/ObjectUnsubscribedError';

export class Subject<T> extends Observable<T> implements Observer<T> {
  private _subscribers: Subscriber<T>[] = [];
  protected _closed = false;
  protected _hasError = false;
  private _error: any;
  protected _disposed = false;

  get closed() {
    return this._closed;
  }

  get disposed() {
    return this._disposed;
  }

  protected _init(subscriber: Subscriber<T>): TeardownLogic {
    this._throwIfDisposed();
    if (this._hasError) {
      subscriber.error(this._error);
      return;
    }

    if (this._closed) {
      return;
    }

    const { _subscribers } = this;
    _subscribers.push(subscriber);
    return () => {
      const i = _subscribers.indexOf(subscriber);
      if (i >= 0) {
        _subscribers.splice(i, 1);
      }
    };
  }

  next(value: T) {
    this._throwIfDisposed();
    if (!this._closed) {
      const { _subscribers } = this;
      for (const subscriber of _subscribers) {
        subscriber.next(value);
      }
    }
  }

  error(err: any) {
    this._throwIfDisposed();
    if (!this._closed) {
      this._closed = true;
      this._hasError = true;
      this._error = err;
      const { _subscribers } = this;
      for (const subscriber of _subscribers) {
        subscriber.error(err);
      }
      _subscribers.length = 0;
    }
  }

  complete() {
    this._throwIfDisposed();
    if (!this._closed) {
      this._closed = true;
      const { _subscribers } = this;
      for (const subscriber of _subscribers) {
        subscriber.complete();
      }
      _subscribers.length = 0;
    }
  }

  unsubscribe() {
    this._subscribers = null;
    this._disposed = true;
  }

  private _throwIfDisposed() {
    if (this._disposed) {
      throw new ObjectUnsubscribedError();
    }
  }
}
