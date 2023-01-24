import { ObservableInput, ObservableInputTuple, OperatorFunction, SchedulerLike } from '../types';
import { operate } from '../util/lift';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { mergeAll } from './mergeAll';
import { popNumber, popScheduler } from '../util/args';
import { scheduled } from '../scheduled/scheduled';
import { innerFrom } from '../observable/innerFrom';

/** @deprecated Replaced with {@link mergeWith}. Will be removed in v8. */
export function merge<T, A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;
/** @deprecated Replaced with {@link mergeWith}. Will be removed in v8. */
export function merge<T, A extends readonly unknown[]>(
  ...sourcesAndConcurrency: [...ObservableInputTuple<A>, number]
): OperatorFunction<T, T | A[number]>;
/** @deprecated Replaced with {@link mergeWith}. Will be removed in v8. */
export function merge<T, A extends readonly unknown[]>(
  ...sourcesAndScheduler: [...ObservableInputTuple<A>, SchedulerLike]
): OperatorFunction<T, T | A[number]>;
/** @deprecated Replaced with {@link mergeWith}. Will be removed in v8. */
export function merge<T, A extends readonly unknown[]>(
  ...sourcesAndConcurrencyAndScheduler: [...ObservableInputTuple<A>, number, SchedulerLike]
): OperatorFunction<T, T | A[number]>;

export function merge<T>(...args: unknown[]): OperatorFunction<T, unknown> {
  const scheduler = popScheduler(args);
  const concurrent = popNumber(args, Infinity);
  args = argsOrArgArray(args);

  return operate((source, subscriber) => {
    const sources = [source, ...(args as ObservableInput<T>[])];
    mergeAll(concurrent)(scheduler ? scheduled(sources, scheduler) : innerFrom(sources)).subscribe(subscriber);
  });
}
