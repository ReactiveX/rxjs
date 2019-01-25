import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Notification } from 'rxjs/internal/Notification';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function materialize<T>(): OperatorFunction<T, Notification<T>> {
  return (source: Observable<T>) => source.lift(materializeLifted);
}

function materializeLifted<T>(this: MutableSubscriber<any>, source: Observable<T>) {
  const mut = this;
  const _next = mut.next;
  const _complete = mut.complete;

  mut.next = (value: T) => _next(Notification.createNext(value));
  mut.error = (err: any) => {
    _next(Notification.createError(err));
    _complete();
  };
  mut.complete = () => {
    _next(Notification.createComplete());
    _complete();
  };
  return source.subscribe(mut);
}
