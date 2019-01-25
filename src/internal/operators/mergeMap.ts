import { ObservableInput, OperatorFunction, Operator } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { from } from 'rxjs/internal/create/from';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function mergeMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent = Number.POSITIVE_INFINITY,
): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.lift(mergeMapOperator(project, concurrent));
}

function mergeMapOperator<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent = Number.POSITIVE_INFINITY,
): Operator<T> {
  return function mergeMapLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const _next = mut.next;
    const _complete = mut.complete;
    let _active = 0;
    let _index = 0;
    const _buffer: T[] = [];
    let _outerCompleted = false;

    const innerSubscribe = () => {
      while (_buffer.length > 0 && _active < concurrent) {
        _active++;
        const value = _buffer.shift();
        const result = tryUserFunction((value, index) => from(project(value, index)), [value, _index++]);
        if (resultIsError(result)) {
          mut.error(result.error);
        } else {
          const innerMut = new MutableSubscriber<R>(
            _next,
            mut.error,
            () => {
              _active--;
              if (_buffer.length > 0) {
                innerSubscribe();
              } else if (_outerCompleted && _active === 0) {
                _complete();
              }
            }
          );

          mut.subscription.add(result.subscribe(innerMut));
        }
      }
    };

    mut.next = (value: T) => {
      _buffer.push(value);
      innerSubscribe();
    };

    mut.complete = () => {
      _outerCompleted = true;
      if (_active === 0 && _buffer.length === 0) {
        _complete();
      }
    };

    return source.subscribe(mut);
  };
}
