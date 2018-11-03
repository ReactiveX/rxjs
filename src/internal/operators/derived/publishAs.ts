import { multicastAs } from 'rxjs/internal/operators/multicastAs';
import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction } from 'rxjs/internal/types';
import { Subject } from 'rxjs/internal/Subject';

export function publishAs<T, R>(project: (published: Observable<T>) => Observable<R>): OperatorFunction<T, R> {
  return multicastAs(() => new Subject<T>(), project);
}
