import { create } from './create.js';
import { isObservableInstance } from './util/ctor-helpers.js';
import { subscribeToSource } from './util/observable-helpers.js';
import type { ObservableArrayToValueUnion } from './util/types.js';

export const race: unique symbol = Symbol('race');

declare global {
  interface ObservableCtor {
    [race]: <Sources extends readonly ObservableInput<any>[]>(sources: Sources) => Observable<ObservableArrayToValueUnion<Sources>>;
  }

  interface Observable<T> {
    [race]: <Sources extends readonly ObservableInput<any>[]>(sources: Sources) => Observable<T | ObservableArrayToValueUnion<Sources>>;
  }
}

Observable[race] = raceImpl;
Observable.prototype[race] = raceImpl;

function raceImpl<Sources extends readonly ObservableInput<any>[]>(
  this: ObservableCtor | Observable<any>,
  sources: Sources
): Observable<ObservableArrayToValueUnion<Sources>> {
  const actualSources: readonly ObservableInput<any>[] = isObservableInstance(this) ? [this, ...sources] : [...sources];

  return this[create]((subscriber) => {
    const innerControllers: AbortController[] = [];
    let winner: AbortController | undefined;

    const selectWinner = (innerController: AbortController): boolean => {
      if (winner === undefined) {
        winner = innerController;
        for (const controller of innerControllers) {
          if (controller !== innerController) {
            controller.abort();
          }
        }
      }
      return winner === innerController;
    };

    for (const source of actualSources) {
      if (winner !== undefined || !subscriber.active) {
        break;
      }

      const innerController = new AbortController();
      innerControllers.push(innerController);

      subscribeToSource(
        Observable.from(source),
        subscriber,
        {
          next: (value) => {
            if (selectWinner(innerController)) {
              subscriber.next(value);
            }
          },
          error: (error) => {
            if (selectWinner(innerController)) {
              subscriber.error(error);
            }
          },
          complete: () => {
            if (selectWinner(innerController)) {
              subscriber.complete();
            }
          },
        },
        innerController.signal
      );
    }
  });
}

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `raceWith` form of the exact-Symbol `[race]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[race]` to its source.
 */
export function pipeableRace<T, Sources extends readonly ObservableInput<any>[]>(sources: Sources): (source: Observable<T>) => Observable<T | ObservableArrayToValueUnion<Sources>>;
export function pipeableRace(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[race] as (...values: any[]) => any, source, args);
}

/**
 * Calls the static exact-Symbol `Observable[race]` capability as an ordinary function.
 *
 * Construction, conversion, error forwarding, and cancellation remain owned
 * by the installed Symbol implementation.
 */
export function staticRace<Sources extends readonly ObservableInput<any>[]>(sources: Sources): Observable<ObservableArrayToValueUnion<Sources>>;
export function staticRace(...args: any[]): any {
  return Reflect.apply(Observable[race] as (...values: any[]) => any, Observable, args);
}

// END GENERATED FUNCTIONAL SURFACE
