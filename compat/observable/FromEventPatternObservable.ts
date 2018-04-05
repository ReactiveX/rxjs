import { Observable, fromEventPattern } from 'rxjs';

export class FromEventPatternObservable<T> extends Observable<T> {
  static create<T>(addHandler: (handler: Function) => any,
                   removeHandler?: (handler: Function, signal?: any) => void,
                   selector?: (...args: Array<any>) => T) {
    return fromEventPattern(addHandler, removeHandler, selector);
  }
}