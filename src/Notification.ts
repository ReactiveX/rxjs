import {Observable} from './Observable';

export type NextObserver<T> = {
  next(value: T): void;
};
function isNextObserver<T>(v: any): v is NextObserver<T> {
  return !!v && typeof v.next === 'function';
}

export type ErrorObserver = {
  error(error: any): void;
};
function isErrorObserver<T>(v: any): v is ErrorObserver {
  return !!v && typeof v.error === 'function';
}

export type CompleteObserver = {
  complete(): void;
};
function isCompleteObserver(v: any): v is CompleteObserver {
  return !!v && typeof v.complete === 'function';
}

export class Notification<T> {
  hasValue: boolean;

  constructor(public kind: string, public value?: T, public exception?: any) {
    this.hasValue = kind === 'N';
  }

  observe(observer: NextObserver<T> | ErrorObserver | CompleteObserver): any {
    switch (this.kind) {
      case 'N':
        if (isNextObserver(observer)) {
          return observer.next(this.value);
        } else {
          throw new Error('`observer` should implement NextObserver<T>');
        }
      case 'E':
        if (isErrorObserver(observer)) {
          return observer.error(this.exception);
        } else {
          throw new Error('`observer` should implement ErrorObserver');
        }
      case 'C':
        if (isCompleteObserver(observer)) {
          return observer.complete();
        } else {
          throw new Error('`observer` should implement CompleteObserver');
        }
    }
  }

  do(next: (value: T) => void, error?: (err: any) => void, complete?: () => void): any {
    const kind = this.kind;
    switch (kind) {
      case 'N':
        return next(this.value);
      case 'E':
        return error(this.exception);
      case 'C':
        return complete();
    }
  }

  accept(nextOrObserver: NextObserver<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void) {
    if (isNextObserver(nextOrObserver)) {
      return this.observe(nextOrObserver);
    } else {
      return this.do(<(value: T) => void>nextOrObserver, error, complete);
    }
  }

  toObservable(): Observable<T> {
    const kind = this.kind;
    switch (kind) {
      case 'N':
        return Observable.of(this.value);
      case 'E':
        return Observable.throw(this.exception);
      case 'C':
        return Observable.empty<T>();
    }
  }

  private static completeNotification: Notification<any> = new Notification('C');
  private static undefinedValueNotification: Notification<any> = new Notification('N', undefined);

  static createNext<T>(value: T): Notification<T> {
    if (typeof value !== 'undefined') {
      return new Notification('N', value);
    }
    return this.undefinedValueNotification;
  }

  static createError<T>(err?: any): Notification<T> {
    return new Notification('E', undefined, err);
  }

  static createComplete(): Notification<any> {
    return this.completeNotification;
  }
}
