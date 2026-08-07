import { create } from './create.js';
import type { ObservableArrayToValueArray } from './util/types.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const withLatestFrom: unique symbol = Symbol('withLatestFrom');

declare global {
  interface Observable<T> {
    [withLatestFrom]: {
      <const Sources extends readonly ObservableInput<any>[]>(sources: Sources): Observable<[T, ...ObservableArrayToValueArray<Sources>]>;
      <const Sources extends readonly ObservableInput<any>[], Result>(
        sources: Sources,
        project: (value: T, ...latestValues: ObservableArrayToValueArray<Sources>) => Result
      ): Observable<Result>;
    };
  }
}

Observable.prototype[withLatestFrom] = withLatestFromImpl;

function withLatestFromImpl<T, const Sources extends readonly ObservableInput<any>[]>(
  this: Observable<T>,
  sources: Sources
): Observable<[T, ...ObservableArrayToValueArray<Sources>]>;
function withLatestFromImpl<T, const Sources extends readonly ObservableInput<any>[], Result>(
  this: Observable<T>,
  sources: Sources,
  project: (value: T, ...latestValues: ObservableArrayToValueArray<Sources>) => Result
): Observable<Result>;
function withLatestFromImpl(
  this: Observable<any>,
  sources: readonly ObservableInput<any>[],
  project?: (...values: any[]) => any
): Observable<any> {
  return this[create]((subscriber) => {
    const latestValues: unknown[] = new Array(sources.length);
    const hasValue = new Array(sources.length).fill(false);
    let readyCount = 0;

    for (let index = 0; index < sources.length && !subscriber.signal.aborted; index++) {
      subscribeToSource(Observable.from(sources[index]!), subscriber, {
        next: (value) => {
          latestValues[index] = value;
          if (!hasValue[index]) {
            hasValue[index] = true;
            readyCount++;
          }
        },
        complete: () => void 0,
      });
    }

    if (!subscriber.signal.aborted) {
      subscribeToSource(this, subscriber, {
        next: (value) => {
          if (readyCount === sources.length) {
            const values = [value, ...latestValues];
            subscriber.next(project ? project(...values) : values);
          }
        },
      });
    }
  });
}

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `withLatestFrom` form of the exact-Symbol `[withLatestFrom]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[withLatestFrom]` to its source.
 */
export function pipeableWithLatestFrom<T, const Sources extends readonly ObservableInput<any>[]>(sources: Sources): (source: Observable<T>) => Observable<[T, ...ObservableArrayToValueArray<Sources>]>;
export function pipeableWithLatestFrom<T, const Sources extends readonly ObservableInput<any>[], Result>(sources: Sources, project: (value: T, ...latestValues: ObservableArrayToValueArray<Sources>) => Result): (source: Observable<T>) => Observable<Result>;
export function pipeableWithLatestFrom(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[withLatestFrom] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
