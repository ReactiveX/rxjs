import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

interface PartitionMethod {
  <T, U extends T>(source: ObservableInput<T>, predicate: (value: T, index: number) => value is U): [
    Observable<U>,
    Observable<Exclude<T, U>>
  ];
  <T>(source: ObservableInput<T>, predicate: (value: T, index: number) => boolean): [Observable<T>, Observable<T>];
}

export const partition: unique symbol = Symbol('partition');

declare global {
  interface ObservableCtor {
    [partition]: PartitionMethod;
  }
}

function partitionImpl<T, U extends T>(
  this: ObservableCtor,
  source: ObservableInput<T>,
  predicate: (value: T, index: number) => value is U
): [Observable<U>, Observable<Exclude<T, U>>];
function partitionImpl<T>(
  this: ObservableCtor,
  source: ObservableInput<T>,
  predicate: (value: T, index: number) => boolean
): [Observable<T>, Observable<T>];
function partitionImpl<T>(this: ObservableCtor, source: ObservableInput<T>, predicate: (value: T, index: number) => boolean): any {
  const ObservableCtor = this;
  const input = ObservableCtor.from(source);

  const createBranch = (matchesBranch: boolean): Observable<T> =>
    ObservableCtor[create]((subscriber) => {
      let index = 0;

      subscribeToSource(input, subscriber, {
        next: (value) => {
          if (predicate(value, index++) === matchesBranch) {
            subscriber.next(value);
          }
        },
      });
    });

  return [createBranch(true), createBranch(false)];
}

Observable[partition] = partitionImpl;

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Calls the static exact-Symbol `Observable[partition]` capability as an ordinary function.
 *
 * Construction, conversion, error forwarding, and cancellation remain owned
 * by the installed Symbol implementation.
 */
export function staticPartition<T, U extends T>(source: ObservableInput<T>, predicate: (value: T, index: number) => value is U): [
    Observable<U>,
    Observable<Exclude<T, U>>
  ];
export function staticPartition<T>(source: ObservableInput<T>, predicate: (value: T, index: number) => boolean): [Observable<T>, Observable<T>];
export function staticPartition(...args: any[]): any {
  return Reflect.apply(Observable[partition] as (...values: any[]) => any, Observable, args);
}

// END GENERATED FUNCTIONAL SURFACE
