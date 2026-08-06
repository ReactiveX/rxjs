import { operate } from './pipeable/operate.js';
import { takeOperator } from './pipeable/take-operator.js';

export const take: unique symbol = Symbol('take');

declare global {
  interface Observable<T> {
    [take]: (count: number) => Observable<T>;
  }
}

Observable.prototype[take] = function <T>(this: Observable<T>, count: number): Observable<T> {
  return operate(takeOperator<T>(count))(this);
};
