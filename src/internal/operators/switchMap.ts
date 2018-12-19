import { ObservableInput, OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { OperatorSubscriber } from 'rxjs/internal/OperatorSubscriber';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { from } from 'rxjs/internal/create/from';

export function switchMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>
): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.lift(switchMapOperator(project));
}

function switchMapOperator<T, R>(project: (value: T, index: number) => ObservableInput<R>) {
  return function switchMapLift(this: Subscriber<R>, source: Observable<T>, subscription: Subscription) {
    return source.subscribe(new SwitchMapSubscriber(subscription, this, project), subscription);
  };
}

class SwitchMapSubscriber<T, R> extends OperatorSubscriber<T> {
  private _innerSub: Subscription;
  private _complete = false;
  private _index = 0;

  constructor(
    subscription: Subscription,
    destination: Subscriber<R>,
    private project: (value: T, index: number) => ObservableInput<R>
  ) {
    super(subscription, destination);
  }

  next(value: T) {
    const { _destination } = this;
    const result = tryUserFunction(() => from(this.project(value, this._index++)));
    if (resultIsError(result)) {
      _destination.error(result.error);
    } else {
      if (this._innerSub) {
        this._innerSub.unsubscribe();
      }
      const innerSub = this._innerSub = new Subscription();
      this._subscription.add(innerSub);
      innerSub.add(() => {
        this._subscription.remove(innerSub);
        this._innerSub = undefined;
      });
      result.subscribe({
        next: (value: R) => _destination.next(value),
        error: (err: any) => _destination.error(err),
        complete: () => {
          if (this._complete) {
            _destination.complete();
          }
        }
      }, innerSub);
    }
  }

  complete() {
    this._complete = true;
    if (!this._innerSub) {
      this._destination.complete();
    }
  }
}
