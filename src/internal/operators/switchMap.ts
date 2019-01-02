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
  return (source: Observable<T>) =>
    new Observable(subscriber => source.subscribe(new SwitchMapSubscriber(subscriber, project)));
}

class SwitchMapSubscriber<T, R> extends OperatorSubscriber<T> {
  private _innerSub: Subscription;
  private _completed = false;
  private _index = 0;

  constructor(
    destination: Subscriber<R>,
    private project: (value: T, index: number) => ObservableInput<R>
  ) {
    super(destination);
  }

  _next(value: T) {
    const { _destination } = this;
    const result = tryUserFunction(() => from(this.project(value, this._index++)));
    if (resultIsError(result)) {
      _destination.error(result.error);
    } else {
      if (this._innerSub) {
        this._subscription.remove(this._innerSub);
        this._innerSub.unsubscribe();
        this._innerSub = null;
      }
      const innerSubscriber = new InnerSubscriber(this._destination, this);
      this._subscription.add(this._innerSub = result.subscribe(innerSubscriber));
    }
  }

  complete() {
    this._completed = true;
    if (!this._innerSub || this._innerSub.closed) {
      super.complete();
    }
  }
}

class InnerSubscriber<T> extends OperatorSubscriber<T> {
  constructor(destination: Subscriber<T>, private outerSubscriber: SwitchMapSubscriber<any, T>) {
    super(destination);
  }

  _complete() {
    const { outerSubscriber } = this;
    if ((outerSubscriber as any)._completed) {
      this._destination.complete();
    }
    this._subscription.unsubscribe();
  }
}
