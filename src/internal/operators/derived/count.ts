import { reduce } from './reduce';
import { filter } from '../filter';
import { pipe } from '../../util/pipe';

const DEFAULT_COUNT_REDUCE = reduce((count) => count + 1, 0);

export const count = <T>(predicate?: (value: T, index: number) => boolean) => {
  return predicate
   ? pipe(filter(predicate), DEFAULT_COUNT_REDUCE)
   : DEFAULT_COUNT_REDUCE;
};
