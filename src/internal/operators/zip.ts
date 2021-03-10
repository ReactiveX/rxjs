import { zip as zipStatic } from '../observable/zip';
import { ObservableInput, ObservableInputTuple, OperatorFunction, Cons } from '../types';
import { operate } from '../util/lift';

/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, A extends readonly unknown[]>(otherInputs: [...ObservableInputTuple<A>]): OperatorFunction<T, Cons<T, A>>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, A extends readonly unknown[], R>(
  otherInputsAndProject: [...ObservableInputTuple<A>],
  project: (...values: Cons<T, A>) => R
): OperatorFunction<T, R>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, A extends readonly unknown[]>(...otherInputs: [...ObservableInputTuple<A>]): OperatorFunction<T, Cons<T, A>>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, A extends readonly unknown[], R>(
  ...otherInputsAndProject: [...ObservableInputTuple<A>, (...values: Cons<T, A>) => R]
): OperatorFunction<T, R>;

/**
 * @deprecated Deprecated. Use {@link zipWith}.
 */
export function zip<T, R>(...sources: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): OperatorFunction<T, any> {
  return operate((source, subscriber) => {
    zipStatic(source, ...sources).subscribe(subscriber);
  });
}
