import { of, asyncScheduler, Observable, scheduled, ObservableInput } from 'rxjs';
import { observable } from 'rxjs/internal/symbol/observable';
import { iterator } from 'rxjs/internal/symbol/iterator';

if (process && process.on) {
  /**
   * With async/await functions in Node, mocha seems to allow
   * tests to pass, even they shouldn't there's something about how
   * it handles the rejected promise where it does not notice
   * that the test failed.
   */
  process.on('unhandledRejection', err => {
    console.error(err);
    process.exit(1);
  });
}

export function lowerCaseO<T>(...args: Array<any>): Observable<T> {
  const o: any = {
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

/**
 * Used to signify no subscriptions took place to `expectSubscriptions` assertions.
 */
export const NO_SUBS: string[] = [];