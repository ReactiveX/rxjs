import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

interface PartitionMethod {
  <T, U extends T, A>(source: ObservableValue<T>, predicate: (this: A, value: T, index: number) => value is U, thisArg: A): [
    Observable<U>,
    Observable<Exclude<T, U>>
  ];
  <T, U extends T>(source: ObservableValue<T>, predicate: (value: T, index: number) => value is U): [
    Observable<U>,
    Observable<Exclude<T, U>>
  ];
  <T, A>(source: ObservableValue<T>, predicate: (this: A, value: T, index: number) => boolean, thisArg: A): [Observable<T>, Observable<T>];
  <T>(source: ObservableValue<T>, predicate: (value: T, index: number) => boolean): [Observable<T>, Observable<T>];
}

export const partition: unique symbol = Symbol('partition');

declare global {
  interface ObservableCtor {
    [partition]: PartitionMethod;
  }
}

function partitionImpl<T, U extends T, A>(
  this: ObservableCtor,
  source: ObservableValue<T>,
  predicate: (this: A, value: T, index: number) => value is U,
  thisArg: A
): [Observable<U>, Observable<Exclude<T, U>>];
function partitionImpl<T, U extends T>(
  this: ObservableCtor,
  source: ObservableValue<T>,
  predicate: (value: T, index: number) => value is U
): [Observable<U>, Observable<Exclude<T, U>>];
function partitionImpl<T, A>(
  this: ObservableCtor,
  source: ObservableValue<T>,
  predicate: (this: A, value: T, index: number) => boolean,
  thisArg: A
): [Observable<T>, Observable<T>];
function partitionImpl<T>(
  this: ObservableCtor,
  source: ObservableValue<T>,
  predicate: (value: T, index: number) => boolean
): [Observable<T>, Observable<T>];
function partitionImpl<T, A>(
  this: ObservableCtor,
  source: ObservableValue<T>,
  predicate: (this: A, value: T, index: number) => boolean,
  thisArg?: A
): any {
  const ObservableCtor = this;
  const input = ObservableCtor.from(source);

  const createBranch = (matchesBranch: boolean): Observable<T> =>
    ObservableCtor[create]((subscriber) => {
      let index = 0;

      subscribeToSource(input, subscriber, {
        next: (value) => {
          if (predicate.call(thisArg as A, value, index++) === matchesBranch) {
            subscriber.next(value);
          }
        },
      });
    });

  return [createBranch(true), createBranch(false)];
}

Observable[partition] = partitionImpl;
