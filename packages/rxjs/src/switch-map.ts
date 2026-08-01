import { create } from './create.js';
import { convertObservableValue, subscribeToSource } from './util/observable-helpers.js';

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

  return this[create]((subscriber) => {
    let outerComplete = false;
    let index = 0;
    const active: AbortController[] = [];

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (active.length >= concurrent) {
          active.shift()!.abort();
        }

        const innerController = new AbortController();
        active.push(innerController);

        subscribeToSource(
          convertObservableValue({ value: mapper(value, index++) }),
          subscriber,
          {
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
          },
          innerController.signal
        );
      },
      complete: () => {
        outerComplete = true;
        if (active.length === 0) {
          subscriber.complete();
        }
      },
    });
  });
}

Observable.prototype[switchMap] = switchMapOperator;
