import { Operation } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { ArgumentOutOfRangeError } from 'rxjs/internal/error/ArgumentOutOfRangeError';
import { filter } from 'rxjs/internal/operators/filter';
import { take } from 'rxjs/internal/operators/take';
import { throwIfEmpty } from 'rxjs/internal/operators/derived/throwIfEmpty';
import { defaultIfEmpty } from 'rxjs/internal/operators/defaultIfEmpty';

export function elementAt<T>(index: number, defaultValue?: T): Operation<T, T> {
  if (index < 0) { throw new ArgumentOutOfRangeError(); }
  const hasDefaultValue = arguments.length >= 2;
  return (source: Observable<T>) => source.pipe(
    filter((v, i) => i === index),
    take(1),
    hasDefaultValue
      ? defaultIfEmpty(defaultValue)
      : throwIfEmpty(() => new ArgumentOutOfRangeError()),
  );
}
