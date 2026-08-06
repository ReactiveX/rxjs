import { mapOperator } from './pipeable/map.js';
import { operate } from './pipeable/operate.js';

export const map: unique symbol = Symbol('map');

declare global {
  interface Observable<T> {
    [map]: {
      <R>(project: (value: T, index: number) => R): Observable<R>;
    };
  }
}

function mapSymbolOperator<In, Out>(this: Observable<In>, project: (value: In, index: number) => Out): Observable<Out> {
  return operate(mapOperator(project))(this);
}

Observable.prototype[map] = mapSymbolOperator;
