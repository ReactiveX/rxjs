import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction } from 'rxjs/internal/types';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function filter<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(filterOperator(predicate));
}

function filterOperator<T>(predicate: (value: T, index: number) => boolean) {
  return function filterLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const _next = mut.next;
    let _index = 0;
    mut.next = (value: T) => {
      const result = tryUserFunction(predicate, [value, _index++]);
      if (resultIsError(result)) {
        mut.error(result.error);
      } else {
        if (result) {
          _next(value);
        }
      }
    };
    return source.subscribe(mut);
  };
}
