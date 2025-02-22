import { create } from './create.js';

export const switchMap: unique symbol = Symbol('switchMap');

declare global {
  interface Observable<T> {
    [switchMap]: <R>(mapper: (value: T, index: number) => ObservableValue<T>, options?: { concurrent?: number }) => Observable<R>;
  }
}

Observable.prototype[switchMap] = function <T, R>(
  this: Observable<T>,
  mapper: (value: T, index: number) => ObservableValue<R>,
  options?: { concurrent?: number }
): Observable<R> {
  const { concurrent = 1 } = options ?? {};
  if (concurrent === 1) {
    return this.switchMap(mapper);
  }

  return this[create]((subscriber) => {
    let outerComplete = false;
    let index = 0;
    const active: AbortController[] = [];

    const nextHandler = (value: R) => subscriber.next(value);
    const errorHandler = (error: any) => subscriber.error(error);

    this.subscribe(
      {
        next: (value) => {
          if (active.length >= concurrent) {
            active.shift()!.abort();
          }

          const innerController = new AbortController();
          active.push(innerController);
          const signal = AbortSignal.any([subscriber.signal, innerController.signal]);

          let source: Observable<R>;

          try {
            source = Observable.from(mapper(value, index++));
          } catch (error) {
            subscriber.error(error);
            return;
          }

          source.subscribe(
            {
              next: nextHandler,
              error: errorHandler,
              complete: () => {
                const i = active.indexOf(innerController);
                if (i !== -1) {
                  active.splice(i, 1);
                }
                if (outerComplete && active.length === 0) {
                  subscriber.complete();
                }
              },
            },
            { signal }
          );
        },
        error: errorHandler,
        complete: () => {
          outerComplete = true;
          if (active.length === 0) {
            subscriber.complete();
          }
        },
      },
      { signal: subscriber.signal }
    );
  });
};
