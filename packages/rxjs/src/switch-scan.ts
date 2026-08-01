import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';
import type { ObservedValueOf } from './util/types.js';

export const switchScan: unique symbol = Symbol('switchScan');

declare global {
  interface Observable<T> {
    [switchScan]<R, Input extends ObservableValue<any>>(
      accumulator: (accumulator: R, value: T, index: number) => Input,
      seed: R
    ): Observable<ObservedValueOf<Input>>;
  }
}

function switchScanOperator<T, R, Input extends ObservableValue<any>>(
  this: Observable<T>,
  accumulator: (accumulator: R, value: T, index: number) => Input,
  seed: R
): Observable<ObservedValueOf<Input>> {
  const source = this;

  return source[create]<ObservedValueOf<Input>>((subscriber) => {
    let state: R | ObservedValueOf<Input> = seed;
    let index = 0;
    let sourceComplete = false;
    let innerController: AbortController | undefined;

    const completeIfDone = (): void => {
      if (sourceComplete && !innerController) {
        subscriber.complete();
      }
    };

    const startInner = (value: T): void => {
      innerController?.abort();

      const controller = new AbortController();
      innerController = controller;
      const currentIndex = index++;
      let input: Input;

      try {
        // RxJS 7 types the accumulator state from the seed even though each
        // emitted inner value becomes the runtime state for the next call.
        input = accumulator(state as R, value, currentIndex);
      } catch (error) {
        innerController = undefined;
        controller.abort();
        subscriber.error(error);
        return;
      }

      let inner: Observable<ObservedValueOf<Input>>;
      try {
        inner = Observable.from(input);
      } catch (error) {
        innerController = undefined;
        controller.abort();
        subscriber.error(error);
        return;
      }

      if (!subscriber.active || controller.signal.aborted) {
        return;
      }

      try {
        inner.subscribe(
          {
            next: (innerValue) => {
              if (innerController !== controller || controller.signal.aborted) {
                return;
              }
              state = innerValue;
              subscriber.next(innerValue);
            },
            error: (error) => {
              if (innerController === controller) {
                innerController = undefined;
              }
              subscriber.error(error);
            },
            complete: () => {
              if (innerController !== controller) {
                return;
              }
              innerController = undefined;
              completeIfDone();
            },
          },
          { signal: AbortSignal.any([subscriber.signal, controller.signal]) }
        );
      } catch (error) {
        if (innerController === controller) {
          innerController = undefined;
        }
        controller.abort();
        subscriber.error(error);
      }
    };

    try {
      source.subscribe(
        {
          next: (value) => {
            if (subscriber.active) {
              startInner(value);
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => {
            sourceComplete = true;
            completeIfDone();
          },
        },
        { signal: subscriber.signal }
      );
    } catch (error) {
      subscriber.error(error);
    }
  });
}

installObservableExtension({ instance: switchScanOperator, name: 'switchScan', symbol: switchScan });
