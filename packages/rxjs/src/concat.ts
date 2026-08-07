import { merge } from './merge.js';
import type { ObservableArrayToValueUnion } from './util/types.js';

export const concat: unique symbol = Symbol('concat');

declare global {
  interface ObservableCtor {
    [concat]: <Sources extends readonly ObservableInput<any>[]>(otherSources: Sources) => Observable<ObservableArrayToValueUnion<Sources>>;
  }

  interface Observable<T> {
    [concat]: <Sources extends readonly ObservableInput<any>[]>(
      otherSources: Sources
    ) => Observable<T | ObservableArrayToValueUnion<Sources>>;
  }
}

Observable[concat] = concatImpl;
Observable.prototype[concat] = concatImpl;

function concatImpl<Sources extends readonly ObservableInput<any>[]>(
  this: ObservableCtor | Observable<any>,
  sources: Sources
): Observable<ObservableArrayToValueUnion<Sources>> {
  return this[merge](sources, { concurrency: 1 });
}

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `concatWith` form of the exact-Symbol `[concat]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[concat]` to its source.
 */
export function pipeableConcat<T, Sources extends readonly ObservableInput<any>[]>(otherSources: Sources): (source: Observable<T>) => Observable<T | ObservableArrayToValueUnion<Sources>>;
export function pipeableConcat(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[concat] as (...values: any[]) => any, source, args);
}

/**
 * Calls the static exact-Symbol `Observable[concat]` capability as an ordinary function.
 *
 * Construction, conversion, error forwarding, and cancellation remain owned
 * by the installed Symbol implementation.
 */
export function staticConcat<Sources extends readonly ObservableInput<any>[]>(otherSources: Sources): Observable<ObservableArrayToValueUnion<Sources>>;
export function staticConcat(...args: any[]): any {
  return Reflect.apply(Observable[concat] as (...values: any[]) => any, Observable, args);
}

// END GENERATED FUNCTIONAL SURFACE
