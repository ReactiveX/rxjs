import { Observable } from '../Observable';

export function operators(operators: Object): Observable<any> {
  class TempObservable<T> extends Observable<T> {
    constructor(source: Observable<T>) {
      super();
      this.source = source;
    }

      __operators: Object = operators;
  }

  Object.keys(operators)
    .forEach(key => {
      if (operators.hasOwnProperty(key)) {
        TempObservable.prototype[key] = function (...args: any[]) {
          return this.__operators[key].apply(this.source, args);
        };
      }
    });

  return new TempObservable(this);
}