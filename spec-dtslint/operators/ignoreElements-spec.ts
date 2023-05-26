import { of, ignoreElements, tap } from 'rxjs';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(ignoreElements()); // $ExpectType Observable<never>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(ignoreElements('nope')); // $ExpectError
});

it('should not break the inference of type', () => {
  const o$ = of(1, 2, 3).pipe(
    tap((o) => {
      const t = o; // $ExpectType number
    }),
    ignoreElements(),
  );
});

it('should not break the inference of types when piped in a larger chain', () => {
  const o$ = of('a string').pipe(
    tap((o) => {
      const t = o; // $ExpectType string
    }),
    tap((o) => {
      const t = o; // $ExpectType string
    }),
    ignoreElements(),
    tap((o) => {
      const t = o; // $ExpectType never
    }),
  );
});
