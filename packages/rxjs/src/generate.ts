import { create } from './create.js';

export interface GenerateBaseOptions<S> {
  initialState: S;
  condition?: (state: S) => boolean;
  iterate: (state: S) => S;
}

export interface GenerateOptions<T, S> extends GenerateBaseOptions<S> {
  resultSelector: (state: S) => T;
}

interface GenerateMethod {
  <S>(initialState: S, condition: (state: S) => boolean, iterate: (state: S) => S): Observable<S>;
  <T, S>(initialState: S, condition: (state: S) => boolean, iterate: (state: S) => S, resultSelector: (state: S) => T): Observable<T>;
  <T, S>(options: GenerateOptions<T, S>): Observable<T>;
  <S>(options: GenerateBaseOptions<S>): Observable<S>;
}

export const generate: unique symbol = Symbol('generate');

declare global {
  interface ObservableCtor {
    [generate]: GenerateMethod;
  }
}

Observable[generate] = function generateImpl<T, S>(
  this: ObservableCtor,
  initialStateOrOptions: S | GenerateOptions<T, S>,
  condition?: (state: S) => boolean,
  iterate?: (state: S) => S,
  resultSelector?: (state: S) => T
): Observable<T | S> {
  let initialState: S;
  let selectedCondition: ((state: S) => boolean) | undefined;
  let selectedIterate: (state: S) => S;
  let selectedResult: (state: S) => T | S;

  if (arguments.length === 1) {
    const options = initialStateOrOptions as GenerateOptions<T, S>;
    if ('scheduler' in (options as object) && (options as GenerateOptions<T, S> & { scheduler?: unknown }).scheduler !== undefined) {
      throw new Error('Scheduler-backed generate is not supported by this Symbol contract.');
    }
    initialState = options.initialState;
    selectedCondition = options.condition;
    selectedIterate = options.iterate;
    selectedResult = options.resultSelector ?? ((state) => state);
  } else {
    if (arguments.length > 4) {
      throw new Error('Scheduler-backed generate is not supported by this Symbol contract.');
    }
    initialState = initialStateOrOptions as S;
    selectedCondition = condition;
    selectedIterate = iterate as (state: S) => S;
    selectedResult = resultSelector ?? ((state) => state);
  }

  return this[create]((subscriber) => {
    let state = initialState;

    while (subscriber.active) {
      let shouldContinue = true;
      try {
        shouldContinue = selectedCondition?.(state) ?? true;
      } catch (error) {
        subscriber.error(error);
        return;
      }

      if (!shouldContinue) {
        subscriber.complete();
        return;
      }

      let value: T | S;
      try {
        value = selectedResult(state);
      } catch (error) {
        subscriber.error(error);
        return;
      }
      subscriber.next(value);

      if (!subscriber.active) {
        return;
      }

      try {
        state = selectedIterate(state);
      } catch (error) {
        subscriber.error(error);
        return;
      }
    }
  });
};
