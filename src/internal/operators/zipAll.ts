import { Observable } from '../Observable';
import { OperatorFunction, ObservableInput } from '../types';
import { lift } from '../util/lift';
import { Subscriber } from '../Subscriber';
import { zip } from '../observable/zip';

export function zipAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export function zipAll<T>(): OperatorFunction<any, T[]>;
export function zipAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export function zipAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;

export function zipAll<T, R>(project?: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R> {
  return (source: Observable<ObservableInput<T>>) => lift(source, function zipAllOperator(this: Subscriber<R|T[]>, source: Observable<ObservableInput<T>>) {
    const subscriber = this;
    const sources: ObservableInput<T>[] = [];
    subscriber.add(
      source.subscribe({
        next: source => sources.push(source),
        error: err => subscriber.error(err),
        complete: () => {
          if (sources.length > 0) {
            const args = project ? [...sources, project] : sources;
            subscriber.add(
              zip(...args).subscribe(subscriber)
            )
          } else {
            subscriber.complete();
          }
        }
      })
    )
  });
}
