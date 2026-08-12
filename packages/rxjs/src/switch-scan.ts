import { create } from './create.js';
import type { ObservedValueOf } from './util/types.js';
import { subscribeToSource } from './util/observable-helpers.js';

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
      // RxJS 7 types the accumulator state from the seed even though each
      // emitted inner value becomes the runtime state for the next call.
      const inner = Observable.from(accumulator(state as R, value, index++));

      if (!subscriber.active || controller.signal.aborted) {
        return;
      }

      subscribeToSource(
        inner,
        subscriber,
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
        controller.signal
      );
    };

    subscribeToSource(source, subscriber, {
      next: (value) => {
        if (subscriber.active) {
          startInner(value);
        }
      },
      complete: () => {
        sourceComplete = true;
        completeIfDone();
      },
    });
  });
}

Observable.prototype[switchScan] = switchScanOperator;
