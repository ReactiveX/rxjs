import {Observer} from './Observer';
import {Observable} from './Observable';

export class Notification<T> {
  hasValue: boolean;

  constructor(public kind: string, public value?: T, public exception?: any) {
    this.hasValue = kind === 'N';
  }

  observe(observer: Observer<T>): void {
    switch (this.kind) {
      case 'N':
        observer.next(this.value);
      case 'E':
        observer.error(this.exception);
      case 'C':
        observer.complete();
    }
  }

  do(next: (value: T) => void, error?: (err: any) => void, complete?: () => void): void {
    const kind = this.kind;
    switch (kind) {
      case 'N':
        next(this.value);
      case 'E':
        error(this.exception);
      case 'C':
        complete();
    }
  }

  accept(nextOrObserver: Observer<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void): void {
    if (nextOrObserver && typeof (<Observer<T>>nextOrObserver).next === 'function') {
      this.observe(<Observer<T>>nextOrObserver);
    } else {
      this.do(<(value: T) => void>nextOrObserver, error, complete);
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
