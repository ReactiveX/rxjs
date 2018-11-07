import { multicastAs } from 'rxjs/internal/operators/multicastAs';
import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction } from 'rxjs/internal/types';
import { AsyncSubject } from 'rxjs/internal/AsyncSubject';

export function publishLastAs<T, R>(project: (published: Observable<T>) => Observable<R>): OperatorFunction<T, R> {
  return multicastAs(() => new AsyncSubject(), project);
}
