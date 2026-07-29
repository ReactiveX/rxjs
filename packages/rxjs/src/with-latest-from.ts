import { create } from './create.js';
import type { ObservableArrayToValueArray } from './util/types.js';

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
  this: Observable<unknown>,
  sources: readonly ObservableValue<unknown>[],
  project?: (...values: unknown[]) => unknown
): Observable<unknown> {
  return this[create]((subscriber) => {
    const latestValues: unknown[] = new Array(sources.length);
    const hasValue = new Array(sources.length).fill(false);
    let readyCount = 0;

    for (let index = 0; index < sources.length && !subscriber.signal.aborted; index++) {
      Observable.from(sources[index]).subscribe(
        {
          next: (value) => {
            latestValues[index] = value;
            if (!hasValue[index]) {
              hasValue[index] = true;
              readyCount++;
            }
          },
          error: (error) => subscriber.error(error),
        },
        { signal: subscriber.signal }
      );
    }

    if (!subscriber.signal.aborted) {
      this.subscribe(
        {
          next: (value) => {
            if (readyCount === sources.length) {
              const values = [value, ...latestValues];
              if (project) {
                try {
                  subscriber.next(project(...values));
                } catch (error) {
                  subscriber.error(error);
                }
              } else {
                subscriber.next(values);
              }
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    }
  });
}
