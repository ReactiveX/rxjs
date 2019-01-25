import { OperatorFunction, Operator } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function takeWhile<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(takeWhileOperator(predicate));
}

function takeWhileOperator<T>(predicate: (value: T, index: number) => boolean): Operator<T> {
  return function takeWhileLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const _next = mut.next;
    let index = 0;
    mut.next = (value: T) => {
      const result = tryUserFunction(predicate, [value, index++]);
      if (resultIsError(result)) {
        mut.error(result.error);
      } else {
        if (result) {
          _next(value);
        } else {
          mut.complete();
        }
      }
    };
    return source.subscribe(mut);
  };
}
