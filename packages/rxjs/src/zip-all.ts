import { create } from './create.js';
import { map } from './map.js';
import { zip } from './zip.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const zipAll: unique symbol = Symbol('zipAll');

declare global {
  interface Observable<T> {
    [zipAll]: {
      <V>(this: Observable<ObservableInput<V>>): Observable<V[]>;
      <V, R>(this: Observable<ObservableInput<V>>, project: (...values: V[]) => R): Observable<R>;
      <R>(this: Observable<ObservableInput<any>>, project: (...values: any[]) => R): Observable<R>;
    };
  }
}

function zipAllOperator<V>(this: Observable<ObservableInput<V>>): Observable<V[]>;
function zipAllOperator<V, R>(this: Observable<ObservableInput<V>>, project: (...values: V[]) => R): Observable<R>;
function zipAllOperator<R>(this: Observable<ObservableInput<any>>, project: (...values: any[]) => R): Observable<R>;
function zipAllOperator<V, R>(this: Observable<ObservableInput<V>>, project?: (...values: V[]) => R): Observable<V[] | R> {
  const outer = this;

  return outer[create]((subscriber) => {
    const sources: Array<ObservableInput<V>> = [];

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

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `zipAll` form of the exact-Symbol `[zipAll]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[zipAll]` to its source.
 */
export function pipeableZipAll<V>(): (source: Observable<ObservableInput<V>>) => Observable<V[]>;
export function pipeableZipAll<V, R>(project: (...values: V[]) => R): (source: Observable<ObservableInput<V>>) => Observable<R>;
export function pipeableZipAll<R>(project: (...values: any[]) => R): (source: Observable<ObservableInput<any>>) => Observable<R>;
export function pipeableZipAll(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[zipAll] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
