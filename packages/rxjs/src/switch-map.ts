import { installObservableExtension } from './util/install-observable-extension.js';
import { convertObservableValue, createDerivedObservable, runWithErrorForwarding, subscribeToSource } from './util/observable-helpers.js';

export const switchMap: unique symbol = Symbol('switchMap');

declare global {
  interface Observable<T> {
    [switchMap]: <R>(mapper: (value: T, index: number) => ObservableValue<R>, options?: { concurrent?: number }) => Observable<R>;
  }
}

function switchMapOperator<T, R>(
  this: Observable<T>,
  mapper: (value: T, index: number) => ObservableValue<R>,
  options?: { concurrent?: number }
): Observable<R> {
  const { concurrent = 1 } = options ?? {};

  return createDerivedObservable({
    receiver: this,
    init: (subscriber) => {
      let outerComplete = false;
      let index = 0;
      const active: AbortController[] = [];

      subscribeToSource({
        source: this,
        subscriber,
        next: (value) => {
          if (active.length >= concurrent) {
            active.shift()!.abort();
          }

          const innerController = new AbortController();
          active.push(innerController);
          const signal = AbortSignal.any([subscriber.signal, innerController.signal]);

          const source = runWithErrorForwarding({
            subscriber,
            run: () => convertObservableValue({ value: mapper(value, index++) }),
          });
          if (!source.ok) {
            return;
          }

          subscribeToSource({
            source: source.value,
            subscriber,
            signal,
            next: (innerValue) => subscriber.next(innerValue),
            complete: () => {
              const activeIndex = active.indexOf(innerController);
              if (activeIndex !== -1) {
                active.splice(activeIndex, 1);
              }
              if (outerComplete && active.length === 0) {
                subscriber.complete();
              }
            },
          });
        },
        complete: () => {
          outerComplete = true;
          if (active.length === 0) {
            subscriber.complete();
          }
        },
      });
    },
  });
}

installObservableExtension({ instance: switchMapOperator, name: 'switchMap', symbol: switchMap });
