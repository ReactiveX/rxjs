declare const global: any;

import { of, asyncScheduler, Observable, scheduled, ObservableInput } from 'rxjs';
import { root } from 'rxjs/internal/util/root';
import { observable } from 'rxjs/internal/symbol/observable';
import { iterator } from 'rxjs/internal/symbol/iterator';

export function lowerCaseO<T>(...args: Array<any>): Observable<T> {
  const o = {
    subscribe(observer: any) {
      args.forEach(v => observer.next(v));
      observer.complete();
      return {
        unsubscribe() { /* do nothing */ }
      };
    }
  };

  o[observable] = function (this: any) {
    return this;
  };

  return <any>o;
}

export const createObservableInputs = <T>(value: T) => of(
  of(value),
  scheduled([value], asyncScheduler),
  [value],
  Promise.resolve(value),
  {
    [iterator]: () => {
      const iteratorResults = [
        { value, done: false },
        { done: true }
      ];
      return {
        next: () => {
          return iteratorResults.shift();
        }
      };
    }
  } as any as Iterable<T>,
  {
    [observable]: () => of(value)
  } as any
) as Observable<ObservableInput<T>>;

global.__root__ = root;
