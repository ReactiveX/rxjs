/** @prettier */
import { OperatorFunction, ObservableInput } from '../types';
import { operate } from '../util/lift';
import { zip } from '../observable/zip';

export function zipAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export function zipAll<T>(): OperatorFunction<any, T[]>;
export function zipAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export function zipAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;

export function zipAll<T, R>(project?: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, any> {
  return operate((source, subscriber) => {
    const sources: ObservableInput<T>[] = [];
    subscriber.add(
      source.subscribe({
        next: (source) => sources.push(source),
        error: (err) => subscriber.error(err),
        complete: () => {
          if (sources.length > 0) {
            const args = project ? [...sources, project] : sources;
            subscriber.add(zip(...args).subscribe(subscriber));
          } else {
            subscriber.complete();
          }
        },
      })
    );
  });
}
