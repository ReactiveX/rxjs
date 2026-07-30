import { create } from './create.js';
import type { ObservedValueOf } from './util/types.js';

export const catchError: unique symbol = Symbol('catchError');

declare global {
  interface Observable<T> {
    [catchError]: <Replacement extends ObservableValue<any>>(
      selector: (error: any, caught: Observable<T>) => Replacement
    ) => Observable<T | ObservedValueOf<Replacement>>;
  }
}

Observable.prototype[catchError] = function <T, Replacement extends ObservableValue<any>>(
  this: Observable<T>,
  selector: (error: any, caught: Observable<T>) => Replacement
): Observable<T | ObservedValueOf<Replacement>> {
  const source = this;
  let caught!: Observable<T>;

  const result = source[create]<T | ObservedValueOf<Replacement>>((subscriber) => {
    let sourceSubscribeInProgress = false;
    let restartRequested = false;

    const startSource = () => {
      if (!subscriber.active) {
        return;
      }
      if (sourceSubscribeInProgress) {
        restartRequested = true;
        return;
      }

      do {
        restartRequested = false;
        const sourceController = new AbortController();
        sourceSubscribeInProgress = true;

        let sourceTerminated = false;
        const handleSourceError = (error: any) => {
          if (sourceTerminated) {
            return;
          }
          sourceTerminated = true;
          sourceController.abort();

          let replacementInput: Replacement;
          try {
            replacementInput = selector(error, caught);
          } catch (selectorError) {
            subscriber.error(selectorError);
            return;
          }

          if (!subscriber.active) {
            return;
          }
          if (Object.is(replacementInput, caught)) {
            startSource();
            return;
          }

          let replacement: Observable<ObservedValueOf<Replacement>>;
          try {
            replacement = Observable.from(replacementInput);
          } catch (replacementError) {
            subscriber.error(replacementError);
            return;
          }

          try {
            replacement.subscribe(
              {
                next: (value) => subscriber.next(value),
                error: (replacementError) => subscriber.error(replacementError),
                complete: () => subscriber.complete(),
              },
              { signal: subscriber.signal }
            );
          } catch (replacementError) {
            subscriber.error(replacementError);
          }
        };

        try {
          source.subscribe(
            {
              next: (value) => subscriber.next(value),
              error: handleSourceError,
              complete: () => {
                sourceTerminated = true;
                subscriber.complete();
              },
            },
            { signal: AbortSignal.any([subscriber.signal, sourceController.signal]) }
          );
        } catch (error) {
          handleSourceError(error);
        }

        sourceSubscribeInProgress = false;
      } while (restartRequested && subscriber.active);
    };

    startSource();
  });

  caught = result as Observable<T>;
  return result;
};
