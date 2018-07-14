import { filter } from '../filter';
import { pipe } from '../../util/pipe';
import { Operation } from '../../types';
import { map } from '../map';

export function findIndex<T>(predicate: (value: T, index: number) => boolean): Operation<T, number> {
  return pipe(
    map((value, index) => predicate(value, index) ? index : -1),
    filter(index => index >= 0),
  );
}
