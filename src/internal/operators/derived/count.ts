import { reduce } from 'rxjs/internal/operators/derived/reduce';
import { filter } from 'rxjs/internal/operators/filter';
import { pipe } from 'rxjs/internal/util/pipe';

const DEFAULT_COUNT_REDUCE = reduce((count) => count + 1, 0);

export const count = <T>(predicate?: (value: T, index: number) => boolean) => {
  return predicate
   ? pipe(filter(predicate), DEFAULT_COUNT_REDUCE)
   : DEFAULT_COUNT_REDUCE;
};
