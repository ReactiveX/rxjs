import { filter } from '../filter';
import { Operation } from '../../types';
import { Observable } from '../../Observable';
import { identity } from '../../util/identity';
import { throwIfEmpty } from './throwIfEmpty';
import { defaultIfEmpty } from '../defaultIfEmpty';
import { take } from '../take';
import { EmptyError } from '../../error/EmptyError';

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
