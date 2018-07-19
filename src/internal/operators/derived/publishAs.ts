import { multicastAs } from 'rxjs/internal/operators/multicastAs';
import { Observable } from '../../Observable';
import { Operation } from 'rxjs/internal/types';
import { Subject } from 'rxjs/internal/Subject';

export function publishAs<T, R>(project: (published: Observable<T>) => Observable<R>): Operation<T, R> {
  return multicastAs(() => new Subject<T>(), project);
}
