import { Observable } from 'rxjs/internal/Observable';
import { ObservableInput, OperatorFunction, Operator } from 'rxjs/internal/types';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { from } from '../create/from';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';
import { noop } from 'rxjs/internal/util/noop';

export function takeUntil<T>(notifier: ObservableInput<any>): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(takeUntilOperator(notifier));
}

function takeUntilOperator<T>(notifier: ObservableInput<any>): Operator<T> {
  return function takeUntilLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const notifierObs = tryUserFunction(() => from(notifier));
    if (resultIsError(notifierObs)) {
      mut.error(notifierObs.error);
      return mut.subscription;
    } else {
      const notifierMut = new MutableSubscriber<any>(
        mut.complete,
        mut.error,
        noop,
      );

      mut.subscription.add(notifierObs.subscribe(notifierMut));
      return source.subscribe(this);
    }
  };
}
