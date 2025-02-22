import { create } from './create.js';
import { isObservableInstance } from './util/ctor-helpers.js';
import { ObservableArrayToValueUnion } from './util/types';

export const race: unique symbol = Symbol('race');

declare global {
  interface ObservableCtor {
    [race]: <Sources extends readonly ObservableValue<any>[]>(sources: Sources) => Observable<ObservableArrayToValueUnion<Sources>>;
  }

  interface Observable<T> {
    [race]: <Sources extends readonly ObservableValue<any>[]>(sources: Sources) => Observable<T | ObservableArrayToValueUnion<Sources>>;
  }
}

Observable[race] = raceImpl;
Observable.prototype[race] = raceImpl;

function raceImpl<Sources extends readonly ObservableValue<any>[]>(
  this: ObservableCtor | Observable<any>,
  sources: Sources
): Observable<ObservableArrayToValueUnion<Sources>> {
  const actualSources: readonly ObservableValue<any>[] = isObservableInstance(this) ? [this, ...sources] : [...sources];

  return this[create]((subscriber) => {
    let innerControllers: AbortController[] | null = [];
    for (const source of actualSources) {
      const innerController = new AbortController();
      innerControllers.push(innerController);

      const handleError = (error: any) => subscriber.error(error);

      const signal = AbortSignal.any([subscriber.signal, innerController.signal]);

      Observable.from(source).subscribe(
        {
          next: (value) => {
            if (innerControllers !== null) {
              for (const controller of innerControllers) {
                if (controller !== innerController) {
                  controller.abort();
                }
              }
              innerControllers = null;
            }
            subscriber.next(value);
          },
          error: handleError,
          complete: () => {
            if (innerControllers === null) {
              subscriber.complete();
            }
          },
        },
        { signal }
      );
    }
  });
}
