import { create } from './create.js';
import type { ObservableArrayToValueArray } from './util/types.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const withLatestFrom: unique symbol = Symbol('withLatestFrom');

declare global {
  interface Observable<T> {
    [withLatestFrom]: {
      <const Sources extends readonly ObservableValue<any>[]>(sources: Sources): Observable<[T, ...ObservableArrayToValueArray<Sources>]>;
      <const Sources extends readonly ObservableValue<any>[], Result>(
        sources: Sources,
        project: (value: T, ...latestValues: ObservableArrayToValueArray<Sources>) => Result
      ): Observable<Result>;
    };
  }
}

Observable.prototype[withLatestFrom] = withLatestFromImpl;

function withLatestFromImpl<T, const Sources extends readonly ObservableValue<any>[]>(
  this: Observable<T>,
  sources: Sources
): Observable<[T, ...ObservableArrayToValueArray<Sources>]>;
function withLatestFromImpl<T, const Sources extends readonly ObservableValue<any>[], Result>(
  this: Observable<T>,
  sources: Sources,
  project: (value: T, ...latestValues: ObservableArrayToValueArray<Sources>) => Result
): Observable<Result>;
function withLatestFromImpl(
  this: Observable<any>,
  sources: readonly ObservableValue<any>[],
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
