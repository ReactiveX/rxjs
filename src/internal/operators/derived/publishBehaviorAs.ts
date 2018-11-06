import { multicastAs } from 'rxjs/internal/operators/multicastAs';
import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction } from 'rxjs/internal/types';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export function publishBehaviorAs<T, R>(initialValue: T, project: (published: Observable<T>) => Observable<R>): OperatorFunction<T, R> {
  return multicastAs(() => new BehaviorSubject(initialValue), project);
}
