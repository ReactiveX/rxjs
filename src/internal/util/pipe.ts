import { identity } from './identity';
import { UnaryFunction } from '../types';

type PipeParameters<T extends any[], U extends any[] = []> = T extends [
  UnaryFunction<any, infer FR> | infer F,
  UnaryFunction<any, infer SR>,
  ...infer R
]
  ? PipeParameters<[UnaryFunction<FR, SR>, ...R], [...U, F]>
  : T extends [any]
  ? [...U, ...T]
  : [];

type PipeReturnType<T extends Array<UnaryFunction<any, any>>> = T extends
  | [UnaryFunction<infer FA, any>, ...any[]]
  | [...any[], UnaryFunction<any, infer LR>]
  ? UnaryFunction<FA, LR>
  : never;

export function pipe(): typeof identity;
export function pipe<T extends Array<UnaryFunction<any, any>>>(...fns: PipeParameters<T>): PipeReturnType<T>;

/**
 * pipe() can be called on one or more functions, each of which can take one argument ("UnaryFunction")
 * and uses it to return a value.
 * It returns a function that takes one argument, passes it to the first UnaryFunction, and then
 * passes the result to the next one, passes that result to the next one, and so on.
 */
export function pipe(...fns: Array<UnaryFunction<any, any>>): UnaryFunction<any, any> {
  return pipeFromArray(fns);
}

/** @internal */
export function pipeFromArray<T, R>(fns: Array<UnaryFunction<T, R>>): UnaryFunction<T, R> {
  if (fns.length === 0) {
    return identity as UnaryFunction<any, any>;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return function piped(input: T): R {
    return fns.reduce((prev: any, fn: UnaryFunction<T, R>) => fn(prev), input as any);
  };
}
