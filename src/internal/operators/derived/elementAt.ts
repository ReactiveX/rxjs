import { Operation } from '../../types';
import { Observable } from '../../Observable';
import { ArgumentOutOfRangeError } from '../../error/ArgumentOutOfRangeError';
import { filter } from '../filter';
import { take } from '../take';
import { throwIfEmpty } from './throwIfEmpty';
import { defaultIfEmpty } from '../defaultIfEmpty';

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
