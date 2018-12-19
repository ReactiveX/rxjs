import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { ObservableInput, OperatorFunction } from 'rxjs/internal/types';
import { Subscriber } from '../Subscriber';
import { OperatorSubscriber } from '../OperatorSubscriber';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { from } from '../create/from';

export function takeUntil<T>(notifier: ObservableInput<any>): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(takeUntilOperator(notifier));
}

function takeUntilOperator<T>(notifier: ObservableInput<any>) {
  return function takeUntilLift(this: Subscriber<T>, source: Observable<T>, subscription: Subscription) {
    return source.subscribe(new TakeUntilSubscriber(subscription, this, notifier), subscription);
  };
}

class TakeUntilSubscriber<T> extends OperatorSubscriber<T> {
  private _notifierSubs = new Subscription();

  constructor(subscription: Subscription, destination: Subscriber<T>, notifier: ObservableInput<any>) {
    super(subscription, destination);
    const { _notifierSubs } = this;
    subscription.add(_notifierSubs);
    const result = tryUserFunction(from, [notifier]);
    if (resultIsError(result)) {
      destination.error(result);
    } else {
      result.subscribe({
        next: () => destination.complete(),
        error: (err: any) => destination.error(err),
      }, _notifierSubs);
    }
  }
}
