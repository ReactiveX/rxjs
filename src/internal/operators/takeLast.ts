import { OperatorFunction, Operator } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscriber } from '../Subscriber';
import { EMPTY } from '../EMPTY';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function takeLast<T>(count: number = 1): OperatorFunction<T, T> {
  count = Math.max(count, 0);
  return (source: Observable<T>) => count === 0 ? EMPTY as any : source.lift(takeLastOperator(count));
}

function takeLastOperator<T>(count: number): Operator<T> {
  return function takeLastLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const _next = mut.next;
    const _complete = mut.complete;
    const _buffer: T[]|null = [];
    mut.next = (value: T) => {
      _buffer.push(value);
      _buffer.splice(0, _buffer.length - count);
    };
    mut.complete = () => {
      for (let i = 0; i < _buffer.length && !mut.closed; i++) {
        _next(_buffer[i]);
      }
      _complete();
      _buffer.length = 0;
    };
    return source.subscribe(mut);
  };
}
