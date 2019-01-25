import { Observable } from 'rxjs/internal/Observable';
import { Operator, OperatorFunction, PartialObserver } from 'rxjs/internal/types';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function tap<T>(
  nextOrObserver: PartialObserver<T>|((value: T) => void)
): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(tapOperator(nextOrObserver));
}

function tapOperator<T>(nextOrObserver: PartialObserver<T>|((value: T) => void)): Operator<T> {
  return function tapLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const _error = mut.error;
    if (nextOrObserver) {
      if (typeof nextOrObserver === 'object') {
        if (nextOrObserver.next) {
          mut.next = wrap(_error, nextOrObserver.next, mut.next, nextOrObserver);
        }
        if (nextOrObserver.error) {
          mut.error = wrap(_error, nextOrObserver.error, _error, nextOrObserver);
        }
        if (nextOrObserver.complete) {
          mut.complete = wrap(_error, nextOrObserver.complete, mut.complete, nextOrObserver);
        }
      } else {
        mut.next = wrap(_error, nextOrObserver, mut.next);
      }
    }
    return source.subscribe(mut);
  };
}

function wrap(forwardError: (err: any) => void, handler: (this: any, ...args: any[]) => any, forwardFn: Function, handlerContext?: any) {
  return function () {
    const result = tryUserFunction(handler, arguments, handlerContext);
    if (resultIsError(result)) {
      forwardError(result.error);
    }
    forwardFn.apply(undefined, arguments);
  };
}
