import { of } from 'rxjs';
import { ignoreElements, tap } from 'rxjs/operators';

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