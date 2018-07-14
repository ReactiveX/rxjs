import { scan } from '../scan';
import { takeLast } from '../takeLast';
import { pipe } from '../../util/pipe';
import { Operation } from '../../types';

export function reduce<T>(reducer: (state: T, value: T, index: number) => T): Operation<T, T>;
export function reduce<T, R>(reducer: (state: T|R, value: T, index: number) => R): Operation<T, R>;
export function reduce<T, R>(reducer: (state: T|R, valeu: T, index: number) => R, initialState: R): Operation<T, R>;
export function reduce<T, R, I>(reducer: (state: I|R, value: T, index: number) => R, initialState: I): Operation<T, R|I>;
export function reduce<T, R, I>(reducer: (state: T|R|I, value: T, index: number) => R, initialState?: R|I): Operation<T, T|R|I> {
  const hasSeed = arguments.length >= 2;

  return pipe(
    hasSeed ? scan(reducer, initialState) : scan(reducer),
    takeLast(),
  );
}
