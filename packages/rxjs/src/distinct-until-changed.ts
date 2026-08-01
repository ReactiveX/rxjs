import { create } from './create.js';

type Comparator<T> = (previous: T, current: T) => boolean;
type KeySelector<T, K> = (value: T) => K;

export const distinctUntilChanged: unique symbol = Symbol('distinctUntilChanged');

declare global {
  interface Observable<T> {
    [distinctUntilChanged]: {
      (comparator?: Comparator<T> | null): Observable<T>;
      <K>(comparator: Comparator<K> | null | undefined, keySelector: KeySelector<T, K>): Observable<T>;
    };
  }
}

function distinctUntilChangedOperator<T>(this: Observable<T>, comparator?: Comparator<T> | null): Observable<T>;
function distinctUntilChangedOperator<T, K>(
  this: Observable<T>,
  comparator: Comparator<K> | null | undefined,
  keySelector: KeySelector<T, K>
): Observable<T>;
function distinctUntilChangedOperator<T, K>(
  this: Observable<T>,
  comparator?: Comparator<K> | null,
  keySelector: KeySelector<T, K> = identity as KeySelector<T, K>
): Observable<T> {
  const compare = comparator ?? defaultCompare;

  return this[create]((subscriber) => {
    let first = true;
    let previousKey: K;

    this.subscribe(
      {
        next: (value) => {
          let currentKey: K;
          try {
            currentKey = keySelector(value);
          } catch (error) {
            subscriber.error(error);
            return;
          }

          let distinct = first;
          if (!first) {
            try {
              distinct = !compare(previousKey, currentKey);
            } catch (error) {
              subscriber.error(error);
              return;
            }
          }

          if (distinct) {
            first = false;
            previousKey = currentKey;
            subscriber.next(value);
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      },
      { signal: subscriber.signal }
    );
  });
}

Observable.prototype[distinctUntilChanged] = distinctUntilChangedOperator;

function identity<T>(value: T): T {
  return value;
}

function defaultCompare<T>(previous: T, current: T): boolean {
  return previous === current;
}
