import { combineLatest } from './combine-latest.js';
import { create } from './create.js';
import { map } from './map.js';
import { subscribeToSource } from './util/observable-helpers.js';

type ObservedValueOf<Input> = Input extends ObservableInput<infer Value> ? Value : never;
type IsUnion<Input, Whole = Input> = Input extends Whole ? ([Whole] extends [Input] ? false : true) : never;
type ProjectValues<Input> = true extends IsUnion<Input> ? any[] : Array<ObservedValueOf<Input>>;
type CombineLatestAllMethod<Input> = [Input] extends [ObservableInput<any>]
  ? {
      (): Observable<Array<ObservedValueOf<Input>>>;
      <Result>(project: (...values: ProjectValues<Input>) => Result): Observable<Result>;
    }
  : never;

export const combineLatestAll: unique symbol = Symbol('combineLatestAll');

declare global {
  interface Observable<T> {
    [combineLatestAll]: CombineLatestAllMethod<T>;
  }
}

function combineLatestAllOperator<V>(this: Observable<ObservableInput<V>>): Observable<V[]>;
function combineLatestAllOperator<V, R>(this: Observable<ObservableInput<V>>, project: (...values: V[]) => R): Observable<R>;
function combineLatestAllOperator<R>(this: Observable<ObservableInput<any>>, project: (...values: any[]) => R): Observable<R>;
function combineLatestAllOperator<V, R>(this: Observable<ObservableInput<V>>, project?: (...values: V[]) => R): Observable<V[] | R> {
  const outer = this;

  return outer[create]((subscriber) => {
    const sources: Array<ObservableInput<V>> = [];

    subscribeToSource(outer, subscriber, {
      next: (source) => sources.push(source),
      error: (error) => subscriber.error(error),
      complete: () => {
        if (sources.length === 0) {
          subscriber.complete();
          return;
        }

        const combined = Observable[combineLatest](sources);
        const result = project ? combined[map]((values) => project(...values)) : combined;

          subscribeToSource(result as Observable<V[] | R>, subscriber);
      },
    });
  });
}

Observable.prototype[combineLatestAll] = combineLatestAllOperator;

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `combineLatestAll` form of the exact-Symbol `[combineLatestAll]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[combineLatestAll]` to its source.
 */
export function pipeableCombineLatestAll<T extends ObservableInput<any>>(): (source: Observable<T>) => Observable<Array<ObservedValueOf<T>>>;
export function pipeableCombineLatestAll<T extends ObservableInput<any>, Result>(project: (...values: ProjectValues<T>) => Result): (source: Observable<T>) => Observable<Result>;
export function pipeableCombineLatestAll(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[combineLatestAll] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
