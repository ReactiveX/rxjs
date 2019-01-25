import { Observable } from 'rxjs/internal/Observable';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { OperatorFunction, Operator } from '../types';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.lift(mapOperator(project));
}

function mapOperator<T, R>(project: (value: T, index: number) => R): Operator<T> {
  return function mapLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const _next = mut.next;
    let index = 0;
    mut.next = (value: T) => {
      const result = tryUserFunction(project, [value, index++]);
      if (resultIsError(result)) {
        mut.error(result.error);
      } else {
        _next(result);
      }
    };
    return source.subscribe(mut);
  };
}
