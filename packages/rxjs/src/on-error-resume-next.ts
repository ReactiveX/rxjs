import { create } from './create.js';
import '@rxjs/observable-polyfill';
import { ObservableArrayToValueUnion } from './util/types.js';

export const onErrorResumeNext: unique symbol = Symbol('onErrorResumeNext');

declare global {
    interface ObservableCtor {
      [onErrorResumeNext]: <Sources extends readonly ObservableValue<any>[]>(
        sources: Sources
      ) => Observable<ObservableArrayToValueUnion<Sources>>;
    }

    interface Observable<T> {
      [onErrorResumeNext]: <Sources extends readonly ObservableValue<any>[]>(
        sources: Sources
      ) => Observable<T | ObservableArrayToValueUnion<Sources>>;
    }
  }
Observable[onErrorResumeNext] = onErrorResumeNextImpl;
Observable.prototype[onErrorResumeNext] = onErrorResumeNextImpl;

function onErrorResumeNextImpl<Sources extends readonly ObservableValue<any>[]>(this: ObservableCtor | Observable<any>, sources: Sources): Observable<ObservableArrayToValueUnion<Sources>> {
  return this[create]((subscriber) => {
    let currentSourceIndex = 0;

    const subscribeNext = (hasError: boolean, error: any) => {
      if (currentSourceIndex >= sources.length) {
        if (hasError) {
            subscriber.error(error);
        } else {
            subscriber.complete();
        }
        return;
      }

      const source = Observable.from(sources[currentSourceIndex++] as ObservableValue<any>);
      source.subscribe({
        next: (value: any) => {
          subscriber.next(value);
        },
        error: (error: any) => {
          hasError = true;
          error = error;
          subscribeNext(true, error);
        },
        complete: () => {
          subscriber.complete();
        },
      }, { signal: subscriber.signal });
    };

    subscribeNext(false, undefined);
  });
}