import { OperatorFunction, Sink, FOType, SinkArg } from "rxjs/internal/types";
import { Observable } from "rxjs/internal/Observable";
import { Subscription } from "rxjs/internal/Subscription";
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { lift } from 'rxjs/internal/util/lift';

export function scan<T>(reducer: (state: T, value: T, index: number) => T): OperatorFunction<T, T>;
export function scan<T, R>(reducer: (state: T|R, value: T, index: number) => R): OperatorFunction<T, R>;
export function scan<T, R>(reducer: (state: R, valeu: T, index: number) => R, initialState: R): OperatorFunction<T, R>;
export function scan<T, R, I>(reducer: (state: I|R, value: T, index: number) => R, initialState: I): OperatorFunction<T, R|I>;
export function scan<T, R, I>(reducer: (state: T|R|I, value: T, index: number) => R, initialState?: R|I): OperatorFunction<T, T|R|I> {
  let hasState = arguments.length >= 2;
  return lift((source: Observable<T>, dest: Sink<R>, subs: Subscription) => {
    let i = 0;
    let state = initialState;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const index = i++;
        if (hasState) {
          v = tryUserFunction(reducer, state, v, index);
          if (resultIsError(v)) {
            dest(FOType.ERROR, v.error, subs);
            subs.unsubscribe();
            return;
          }
        }
        state = v;
        hasState = true;
      }
      dest(t, v, subs);
    }, subs);
  });
}
