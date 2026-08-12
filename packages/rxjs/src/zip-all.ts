import { create } from './create.js';
import { map } from './map.js';
import { zip } from './zip.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const zipAll: unique symbol = Symbol('zipAll');

declare global {
  interface Observable<T> {
    [zipAll]: {
      <V>(this: Observable<ObservableValue<V>>): Observable<V[]>;
      <V, R>(this: Observable<ObservableValue<V>>, project: (...values: V[]) => R): Observable<R>;
      <R>(this: Observable<ObservableValue<any>>, project: (...values: any[]) => R): Observable<R>;
    };
  }
}

function zipAllOperator<V>(this: Observable<ObservableValue<V>>): Observable<V[]>;
function zipAllOperator<V, R>(this: Observable<ObservableValue<V>>, project: (...values: V[]) => R): Observable<R>;
function zipAllOperator<R>(this: Observable<ObservableValue<any>>, project: (...values: any[]) => R): Observable<R>;
function zipAllOperator<V, R>(this: Observable<ObservableValue<V>>, project?: (...values: V[]) => R): Observable<V[] | R> {
  const outer = this;

  return outer[create]((subscriber) => {
    const sources: Array<ObservableValue<V>> = [];

    subscribeToSource(outer, subscriber, {
      next: (source) => sources.push(source),
      error: (error) => subscriber.error(error),
      complete: () => {
        const zipped = zip(sources);
        const result = project ? zipped[map]((values) => project(...values)) : zipped;

          subscribeToSource(result as Observable<V[] | R>, subscriber);
      },
    });
  });
}

Observable.prototype[zipAll] = zipAllOperator;
