import { PartialObserver, NotificationLike } from './types';
import { Observable } from './Observable';
import { Subscription } from './Subscription';
import { isPartialObserver } from './util/isPartialObserver';
import { EMPTY } from './EMPTY';
import { of } from './create/of';
import { throwError } from './create/throwError';

export interface Notification<T> extends NotificationLike<T> {
  /** @deprecated test `kind` for value `"N"` instead. */
  hasValue: boolean;
  observe(observer: PartialObserver<T>): void;
  do(next: (value: T) => void, error?: (err: any) => void, complete?: () => void): void;
  accept(nextOrObserver: PartialObserver<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void) : void;
  toObservable(): Observable<T>;
}

export interface NotificationCtor {
  new(kind: 'N'): Notification<void>;
  new<T>(kind: 'N', value: T): Notification<T>;
  new(kind: 'E', value: void, error: any): Notification<never>;
  new(kind: 'C'): Notification<never>;

  createNext(): Notification<void>;
  createNext<T>(value: T): Notification<T>;
  createError(error?: any): Notification<never>;
  createComplete(): Notification<never>;
}

export const Notification: NotificationCtor = (function <T>(this: Notification<T>, kind: 'N'|'E'|'C', value?: T, error?: any) {
  this.kind = kind;
  this.value = value;
  this.error = error;
}) as any;

Notification.prototype = Object.create(Object.prototype);
Notification.prototype.constructor = Notification;

Object.defineProperty(Notification.prototype, 'hasValue', {
  get() {
    return this.kind === 'N';
  }
});

Notification.prototype.observe = function <T>(observer: PartialObserver<T>, subscription?: Subscription) {
  switch (this.kind) {
    case 'N':
      return observer.next && observer.next(this.value, subscription || new Subscription());
    case 'E':
      return observer.error && observer.error(this.error);
    case 'C':
      return observer.complete && observer.complete();
  }
};

Notification.prototype.do = function<T>(next: (value: T, subscription: Subscription) => void, error?: (err: any) => void, complete?: () => void, subscription?: Subscription) {
  const kind = this.kind;
  switch (kind) {
    case 'N':
      return next && next(this.value, subscription || new Subscription());
    case 'E':
      return error && error(this.error);
    case 'C':
      return complete && complete();
  }
};

Notification.prototype.accept = function<T>(nextOrObserver: PartialObserver<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void, subscription?: Subscription) {
  if (isPartialObserver(nextOrObserver)) {
    return this.observe(<PartialObserver<T>>nextOrObserver, subscription);
  } else {
    return this.do(<(value: T) => void>nextOrObserver, error, complete, subscription);
  }
};

Notification.prototype.toObservable = function<T>() {
  const kind = this.kind;
  switch (kind) {
    case 'N':
      return of(this.value);
    case 'E':
      return throwError(this.error);
    case 'C':
      return EMPTY;
  }
  throw new Error('unexpected notification kind value');
}

const COMPLETE_NOTIFICATION = new Notification('C');
const UNDEFINED_NEXT_NOTIFICATION = new Notification('N');

Notification.createNext = <T>(value?: T) => value === undefined ? UNDEFINED_NEXT_NOTIFICATION : new Notification('N', value);

Notification.createError = (error: any) => new Notification('E', undefined, error);

Notification.createComplete = () => COMPLETE_NOTIFICATION;
