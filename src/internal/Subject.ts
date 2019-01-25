import { Observable } from 'rxjs/internal/Observable';
import { Observer, TeardownLogic } from 'rxjs/internal/types';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { ObjectUnsubscribedError } from 'rxjs/internal/util/ObjectUnsubscribedError';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export class Subject<T> extends Observable<T> implements Observer<T> {
  private _subscribers: MutableSubscriber<T>[] = [];
  protected _closed = false;
  protected _hasError = false;
  protected _hasCompleted = false;
  private _error: any;
  protected _disposed = false;

  get closed() {
    return this._closed;
  }

  get disposed() {
    return this._disposed;
  }

  protected _init(mut: MutableSubscriber<T>): TeardownLogic {
    this._throwIfDisposed();
    if (this._hasError) {
      mut.error(this._error);
      return;
    }

    if (this._hasCompleted) {
      mut.complete();
      return;
    }

    if (this._closed) {
      return;
    }

    const { _subscribers } = this;
    _subscribers.push(mut);
    return () => {
      const i = _subscribers.indexOf(mut);
      if (i >= 0) {
        _subscribers.splice(i, 1);
      }
    };
  }

  next(value: T) {
    this._throwIfDisposed();
    if (!this._closed) {
      const copy = this._subscribers.slice();
      for (const subscriber of copy) {
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
      const copy = this._subscribers.slice();
      for (const subscriber of copy) {
        subscriber.error(err);
      }
      this._subscribers.length = 0;
    }
  }

  complete() {
    this._throwIfDisposed();
    if (!this._closed) {
      this._closed = true;
      this._hasCompleted = true;
      const copy = this._subscribers.slice();
      for (const subscriber of copy) {
        subscriber.complete();
      }
      this._subscribers.length = 0;
    }
  }

  unsubscribe() {
    this._subscribers = null;
    this._disposed = true;
  }

  asObservable(): Observable<T> {
    return new Observable<T>(subscriber => this.subscribe(subscriber));
  }

  private _throwIfDisposed() {
    if (this._disposed) {
      throw new ObjectUnsubscribedError();
    }
  }
}
