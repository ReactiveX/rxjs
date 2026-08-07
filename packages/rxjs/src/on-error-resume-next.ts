import { create } from './create.js';
import '@rxjs/observable-polyfill';
import { isObservableInstance } from './util/ctor-helpers.js';
import { subscribeToSource } from './util/observable-helpers.js';
import type { ObservableArrayToValueUnion } from './util/types.js';

export const onErrorResumeNext: unique symbol = Symbol('onErrorResumeNext');

declare global {
  interface ObservableCtor {
    [onErrorResumeNext]: <Sources extends readonly ObservableInput<any>[]>(
      sources: Sources
    ) => Observable<ObservableArrayToValueUnion<Sources>>;
  }

  interface Observable<T> {
    [onErrorResumeNext]: <Sources extends readonly ObservableInput<any>[]>(
      sources: Sources
    ) => Observable<T | ObservableArrayToValueUnion<Sources>>;
  }
}

Observable[onErrorResumeNext] = onErrorResumeNextImpl;
Observable.prototype[onErrorResumeNext] = onErrorResumeNextImpl;

function onErrorResumeNextImpl<Sources extends readonly ObservableInput<any>[]>(
  this: ObservableCtor | Observable<any>,
  sources: Sources
): Observable<ObservableArrayToValueUnion<Sources>> {
  const actualSources: readonly ObservableInput<any>[] = isObservableInstance(this) ? [this, ...sources] : sources;

  return this[create]((subscriber) => {
    let currentSourceIndex = 0;

    const subscribeNext = () => {
      if (!subscriber.active) {
        return;
      }
      if (currentSourceIndex >= actualSources.length) {
        subscriber.complete();
        return;
      }

      const source = Observable.from(actualSources[currentSourceIndex++]!);
      subscribeToSource(source, subscriber, {
        next: (value: any) => subscriber.next(value),
        error: subscribeNext,
        complete: subscribeNext,
      });
    };

    subscribeNext();
  });
}

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `onErrorResumeNextWith` form of the exact-Symbol `[onErrorResumeNext]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[onErrorResumeNext]` to its source.
 */
export function pipeableOnErrorResumeNext<T, Sources extends readonly ObservableInput<any>[]>(sources: Sources): (source: Observable<T>) => Observable<T | ObservableArrayToValueUnion<Sources>>;
export function pipeableOnErrorResumeNext(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[onErrorResumeNext] as (...values: any[]) => any, source, args);
}

/**
 * Calls the static exact-Symbol `Observable[onErrorResumeNext]` capability as an ordinary function.
 *
 * Construction, conversion, error forwarding, and cancellation remain owned
 * by the installed Symbol implementation.
 */
export function staticOnErrorResumeNext<Sources extends readonly ObservableInput<any>[]>(sources: Sources): Observable<ObservableArrayToValueUnion<Sources>>;
export function staticOnErrorResumeNext(...args: any[]): any {
  return Reflect.apply(Observable[onErrorResumeNext] as (...values: any[]) => any, Observable, args);
}

// END GENERATED FUNCTIONAL SURFACE
