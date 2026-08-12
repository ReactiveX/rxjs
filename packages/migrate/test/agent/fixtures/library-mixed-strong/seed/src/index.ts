import { Observable, from, map, windowTime } from 'rxjs';

export const doubled = (values: Iterable<number>) => from(values).pipe(map((value) => value * 2));

export const windowed = (source: Observable<number>) =>
  source.pipe(
    map((value) => value + 1),
    windowTime(10)
  );

export const selectorFailure = () =>
  from([1]).pipe(
    map(() => {
      throw new Error('selector failed');
    })
  );
