import { scan } from 'rxjs/internal/operators/scan';
import { takeLast } from 'rxjs/internal/operators/takeLast';
import { pipe } from 'rxjs/internal/util/pipe';
import { OperatorFunction } from 'rxjs/internal/types';
import { defaultIfEmpty } from 'rxjs/internal/operators/defaultIfEmpty';

export function reduce<T>(reducer: (state: T, value: T, index: number) => T): OperatorFunction<T, T>;
export function reduce<T, R>(reducer: (state: T|R, value: T, index: number) => R): OperatorFunction<T, R>;
export function reduce<T, R>(reducer: (state: R, value: T, index: number) => R, initialState: R): OperatorFunction<T, R>;
export function reduce<T, R, I>(reducer: (state: I|R, value: T, index: number) => R, initialState: I): OperatorFunction<T, R|I>;
export function reduce<T, R, I>(reducer: (state: T|R|I, value: T, index: number) => R, initialState?: R|I): OperatorFunction<T, T|R|I> {
  const hasSeed = arguments.length >= 2;

  return hasSeed ? pipe(
    scan(reducer, initialState),
    takeLast(),
    defaultIfEmpty(initialState),
  ) : pipe(
    scan(reducer),
    takeLast(),
  );
}
