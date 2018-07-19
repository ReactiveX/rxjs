import { filter } from 'rxjs/internal/operators/filter';
import { pipe } from 'rxjs/internal/util/pipe';
import { Operation } from 'rxjs/internal/types';
import { map } from 'rxjs/internal/operators/map';

export function findIndex<T>(predicate: (value: T, index: number) => boolean): Operation<T, number> {
  return pipe(
    map((value, index) => predicate(value, index) ? index : -1),
    filter(index => index >= 0),
  );
}
