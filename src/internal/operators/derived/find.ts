import { filter } from 'rxjs/internal/operators/filter';
import { take } from 'rxjs/internal/operators/take';
import { pipe } from 'rxjs/internal/util/pipe';

export function find<T>(predicate: (value: T, index: number) => boolean) {
  return pipe(
    filter(predicate),
    take(1),
  );
}
