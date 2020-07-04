import { ZipOperator } from '../observable/zip';
import { Observable } from '../Observable';
import { OperatorFunction, ObservableInput } from '../types';
import { lift } from '../util/lift';

export function zipAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export function zipAll<T>(): OperatorFunction<any, T[]>;
export function zipAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export function zipAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;

export function zipAll<T, R>(project?: (...values: Array<any>) => R): OperatorFunction<T, R> {
  return (source: Observable<T>) => lift(source, new ZipOperator(project));
}
