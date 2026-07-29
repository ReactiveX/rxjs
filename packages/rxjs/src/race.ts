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

      const signal = AbortSignal.any([subscriber.signal, innerController.signal]);

      Observable.from(source).subscribe(
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
        { signal }
      );
    }
  });
}
