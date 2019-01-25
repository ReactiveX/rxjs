import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction, Operator } from '../types';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function defaultIfEmpty<T, R>(defaultValue: R = null): OperatorFunction<T, T|R> {
  return (source: Observable<T>) => source.lift(defaultIfEmptyOperator(defaultValue));
}

function defaultIfEmptyOperator<T, R>(defaultValue: R): Operator<T> {
  return function defaultIfEmptyLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const _next = mut.next;
    const _complete = mut.complete;
    let _hasValue = false;
    mut.next = (value: T) => {
      _hasValue = true;
      _next(value);
    };
    mut.complete = () => {
      if (!_hasValue) {
        _next(defaultValue);
      }
      _complete();
    };
    return source.subscribe(mut);
  };
}
