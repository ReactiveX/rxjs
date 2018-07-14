import { filter } from '../filter';
import { take } from '../take';
import { pipe } from '../../util/pipe';

export function find<T>(predicate: (value: T, index: number) => boolean) {
  return pipe(
    filter(predicate),
    take(1),
  );
}
