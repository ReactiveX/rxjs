import {PartialObserver} from './Observer';
import {Observable} from './Observable';

export class Notification<T> {
  hasValue: boolean;

  constructor(public kind: string, public value?: T, public exception?: any) {
    this.hasValue = kind === 'N';
  }

  observe(observer: PartialObserver<T>): any {
    switch (this.kind) {
      case 'N':
        return observer.next && observer.next(this.value);
      case 'E':
        return observer.error && observer.error(this.exception);
      case 'C':
        return observer.complete && observer.complete();
    }
  }

  do(next: (value: T) => void, error?: (err: any) => void, complete?: () => void): any {
    const kind = this.kind;
    switch (kind) {
      case 'N':
        return next && next(this.value);
      case 'E':
        return error && error(this.exception);
      case 'C':
        return complete && complete();
    }
  }

  accept(nextOrObserver: PartialObserver<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void) {
    if (nextOrObserver && typeof (<PartialObserver<T>>nextOrObserver).next === 'function') {
      return this.observe(<PartialObserver<T>>nextOrObserver);
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
