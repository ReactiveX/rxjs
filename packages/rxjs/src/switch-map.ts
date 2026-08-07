import { create } from './create.js';
import { convertObservableValue, subscribeToSource } from './util/observable-helpers.js';

export const switchMap: unique symbol = Symbol('switchMap');

declare global {
  interface Observable<T> {
    [switchMap]: <R>(mapper: (value: T, index: number) => ObservableInput<R>, options?: { concurrent?: number }) => Observable<R>;
  }
}

function switchMapOperator<T, R>(
  this: Observable<T>,
  mapper: (value: T, index: number) => ObservableInput<R>,
  options?: { concurrent?: number }
): Observable<R> {
  const { concurrent = 1 } = options ?? {};

  return this[create]((subscriber) => {
    let outerComplete = false;
    let index = 0;
    const active: AbortController[] = [];

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (active.length >= concurrent) {
          active.shift()!.abort();
        }

        const innerController = new AbortController();
        active.push(innerController);

        subscribeToSource(
          convertObservableValue({ value: mapper(value, index++) }),
          subscriber,
          {
            next: (innerValue) => subscriber.next(innerValue),
            complete: () => {
              const activeIndex = active.indexOf(innerController);
              if (activeIndex !== -1) {
                active.splice(activeIndex, 1);
              }
              if (outerComplete && active.length === 0) {
                subscriber.complete();
              }
            },
          },
          innerController.signal
        );
      },
      complete: () => {
        outerComplete = true;
        if (active.length === 0) {
          subscriber.complete();
        }
      },
    });
  });
}

Observable.prototype[switchMap] = switchMapOperator;

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `switchMap` form of the exact-Symbol `[switchMap]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[switchMap]` to its source.
 */
export function pipeableSwitchMap<T, R>(mapper: (value: T, index: number) => ObservableInput<R>, options?: { concurrent?: number }): (source: Observable<T>) => Observable<R>;
export function pipeableSwitchMap(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[switchMap] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
