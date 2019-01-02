import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { ObservableInput, OperatorFunction } from 'rxjs/internal/types';
import { Subscriber } from '../Subscriber';
import { OperatorSubscriber } from '../OperatorSubscriber';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { from } from '../create/from';

export function takeUntil<T>(notifier: ObservableInput<any>): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable(subscriber => source.subscribe(new TakeUntilSubscriber(subscriber, notifier)));
}

class TakeUntilSubscriber<T> extends OperatorSubscriber<T> {
  private _notifierSubs = new Subscription();

  constructor(destination: Subscriber<T>, notifier: ObservableInput<any>) {
    super(destination);
    const { _notifierSubs, _subscription } = this;
    _subscription.add(_notifierSubs);
    const result = tryUserFunction(from, [notifier]);
    if (resultIsError(result)) {
      destination.error(result);
    } else {
      _subscription.add(result.subscribe(new NotifierSubscriber(destination)));
    }
  }
}

class NotifierSubscriber extends OperatorSubscriber<any> {
  _next() {
    this._destination.complete();
  }
}
