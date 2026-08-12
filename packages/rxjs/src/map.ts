import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const map: unique symbol = Symbol('map');

declare global {
  interface Observable<T> {
    [map]: {
      <R>(project: (value: T, index: number) => R): Observable<R>;
    };
  }
}

function mapOperator<T, R>(this: Observable<T>, project: (value: T, index: number) => R): Observable<R> {
  return this[create]((subscriber) => {
    let index = 0;

    subscribeToSource(this, subscriber, {
      next(value) {
        subscriber.next(project(value, index++));
      },
    });
  });
}

Observable.prototype[map] = mapOperator;
