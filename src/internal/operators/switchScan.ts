import { Observable } from '../Observable';
import { ObservableInput, OperatorFunction } from '../types';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { switchMap } from './switchMap';
import { tap } from './tap';

export function switchScan<T, R>(
  project: (acc: R, value: T, index: number) => ObservableInput<R>,
  seed?: R
): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.lift(new SwitchScanOperator(project, seed));
}

class SwitchScanOperator<T, R> implements Operator<T, R> {
  private acc: R;

  constructor(private project: (acc: R, value: T, index: number) => ObservableInput<R>,
              seed: R
  ) {
    this.acc = seed;
  }

  call(subscriber: Subscriber<R>, source: any): any {
    const wrappedProject = (value: T, index: number): ObservableInput<R> =>
      this.project(this.acc, value, index);

    return source.pipe(
      switchMap(wrappedProject),
      tap((value: R) => this.acc = value),
    ).subscribe(subscriber);
  }
}
