import { create } from './create.js';
import { isObservableInstance } from './util/ctor-helpers.js';
import { subscribeToSource } from './util/observable-helpers.js';
import type { ObservableArrayToValueUnion } from './util/types.js';

export const merge: unique symbol = Symbol('merge');

declare global {
  interface ObservableCtor {
    [merge]: <Sources extends readonly ObservableInput<any>[]>(
      sources: Sources,
      config?: { concurrency?: number }
    ) => Observable<ObservableArrayToValueUnion<Sources>>;
  }

  interface Observable<T> {
    [merge]: <Sources extends readonly ObservableInput<any>[]>(
      sources: Sources,
      config?: { concurrency?: number }
    ) => Observable<T | ObservableArrayToValueUnion<Sources>>;
  }
}

Observable[merge] = mergeImpl;
Observable.prototype[merge] = mergeImpl;

function mergeImpl<T, Sources extends readonly ObservableInput<any>[]>(
  this: Observable<T> | ObservableCtor,
  sources: Sources,
  config?: { concurrency?: number }
): Observable<ObservableArrayToValueUnion<Sources>> {
  const actualSources = isObservableInstance(this) ? [this, ...sources] : sources;

  return this[create]((subscriber) => {
    const { concurrency = Infinity } = config ?? {};
    let active = 0;
    let sourceIndex = 0;

    const subscribeNext = () => {
      if (sourceIndex === actualSources.length || active >= concurrency) {
        return;
      }

      const sourceValue = actualSources[sourceIndex++]!;
      let source: Observable<any>;

      try {
        source = Observable.from(sourceValue);
      } catch (error) {
        subscriber.error(error);
        return;
      }

      active++;
      subscribeToSource(source, subscriber, {
        complete: () => {
          active--;
          if (sourceIndex < actualSources.length) {
            subscribeNext();
          } else if (active === 0) {
            subscriber.complete();
          }
        },
      });

      if (active < concurrency) {
        subscribeNext();
      }
    };

    subscribeNext();
  });
}

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `mergeWith` form of the exact-Symbol `[merge]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[merge]` to its source.
 */
export function pipeableMerge<T, Sources extends readonly ObservableInput<any>[]>(sources: Sources, config?: { concurrency?: number }): (source: Observable<T>) => Observable<T | ObservableArrayToValueUnion<Sources>>;
export function pipeableMerge(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[merge] as (...values: any[]) => any, source, args);
}

/**
 * Calls the static exact-Symbol `Observable[merge]` capability as an ordinary function.
 *
 * Construction, conversion, error forwarding, and cancellation remain owned
 * by the installed Symbol implementation.
 */
export function staticMerge<Sources extends readonly ObservableInput<any>[]>(sources: Sources, config?: { concurrency?: number }): Observable<ObservableArrayToValueUnion<Sources>>;
export function staticMerge(...args: any[]): any {
  return Reflect.apply(Observable[merge] as (...values: any[]) => any, Observable, args);
}

// END GENERATED FUNCTIONAL SURFACE
