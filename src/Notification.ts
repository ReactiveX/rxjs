import Observer from './Observer';
import Observable from './Observable';
import noop from './util/noop';

export default class Notification<T> {
  hasValue: boolean;
  
  constructor(public kind: string, public value?: T, public exception?: any) {
    this.hasValue = kind === 'N';
  }
  
  observe(observer: Observer<T>): any {
    switch (this.kind) {
      case 'N':
        return observer.next(this.value);
      case 'E':
        return observer.error(this.exception);
      case 'C':
        return observer.complete();
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
  
  accept(nextOrObserver: Observer<T>|((value: T) => void), error?: (err: any) => void, complete?: () => void) {
    if (nextOrObserver && typeof (<Observer<T>>nextOrObserver).next === 'function') {
      return this.observe(<Observer<T>>nextOrObserver);
    } else {
      return this.do(<(value: T) => void>nextOrObserver, error, complete);
    }
  }
  
  toObservable(): Observable<T> {
    const kind = this.kind;
    const value = this.value;
    switch (kind) {
      case 'N':
        return Observable.of(value);  
      case 'E':
        return Observable.throw(value);
      case 'C':
        return Observable.empty();  
    }
  }
  
  static createNext<T>(value: T): Notification<T> {
    return new Notification('N', value);
  }
  
  static createError<T>(err: any): Notification<T> {
    return new Notification('E', undefined, err);
  }
  
  static createComplete(): Notification<any> {
    return new Notification('C');
  }
}