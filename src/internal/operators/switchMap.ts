import { ObservableInput, OperatorFunction, Operator } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { from } from 'rxjs/internal/create/from';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function switchMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>
): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.lift(switchMapOperator(project));
}

function switchMapOperator<T, R>(project: (value: T, index: number) => ObservableInput<R>): Operator<T> {
  return function switchMapLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const _next = mut.next;
    const _complete = mut.complete;
    let index = 0;
    let _innerSub: Subscription;
    let _outerCompleted = false;

    mut.next = (value: T) => {
      const result = tryUserFunction(() => from(project(value, index++)));
      if (resultIsError(result)) {
        mut.error(result.error);
      } else {
        if (_innerSub) {
          const _innerSubCopy = _innerSub;
          _innerSub = null;
          _innerSubCopy.unsubscribe();
        }
        const innerMut = new MutableSubscriber<R>(
          _next,
          mut.error,
          () => {
            if (_outerCompleted) {
              mut.complete();
            }
          }
        );
        mut.subscription.add(_innerSub = result.subscribe(innerMut));
      }
    };

    mut.complete = () => {
      _outerCompleted = true;
      if (!_innerSub) {
        _complete();
      }
    };

    return source.subscribe(mut);
  };
}
