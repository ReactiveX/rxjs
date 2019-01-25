import { OperatorFunction, Operator } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { ArgumentOutOfRangeError } from 'rxjs/internal/util/ArgumentOutOfRangeError';
import { EMPTY } from 'rxjs/internal/EMPTY';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function take<T>(total: number): OperatorFunction<T, T|never> {
  if (total < 0) {
    throw new ArgumentOutOfRangeError();
  }
  return (source: Observable<T>) => total === 0 ? EMPTY as any : source.lift(takeOperator(total));
}

function takeOperator<T>(total: number): Operator<T> {
  return function takeLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    let counter = 0;
    const _next = mut.next;
    mut.next = (value: T) => {
      const c = ++counter;
      if (c <= total) {
        _next(value);
        if (c === total) {
          mut.complete();
        }
      }
    };
    return mut.subscription;
  };
}
