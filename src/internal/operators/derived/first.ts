import { filter } from 'rxjs/internal/operators/filter';
import { Operation } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { identity } from 'rxjs/internal/util/identity';
import { throwIfEmpty } from 'rxjs/internal/operators/derived/throwIfEmpty';
import { defaultIfEmpty } from 'rxjs/internal/operators/defaultIfEmpty';
import { take } from 'rxjs/internal/operators/take';
import { EmptyError } from 'rxjs/internal/util/EmptyError';

export function first<T>(
  predicate?: (value: T, index: number) => boolean,
  defaultValue?: T
): Operation<T, T> {
  const hasDefaultValue = arguments.length >= 2;
  return (source: Observable<T>) => source.pipe(
    predicate ? filter(predicate) : identity,
    take(1),
    hasDefaultValue ? defaultIfEmpty(defaultValue) : throwIfEmpty(() => new EmptyError()),
  );
}
