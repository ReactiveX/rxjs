import { CombineLatestOperator } from '../observable/combineLatest';
import { Observable } from '../Observable';
import { OperatorFunction, ObservableInput } from '../types';

export function combineAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export function combineAll<T>(): OperatorFunction<any, T[]>;
export function combineAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export function combineAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;
export function combineAll<T, R>(project?: (...values: Array<any>) => R): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.lift(new CombineLatestOperator(project));
}
