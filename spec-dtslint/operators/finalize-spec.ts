import { of, finalize } from 'rxjs';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(finalize(() => {})); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(finalize()); // $ExpectError
  const p = of(1, 2, 3).pipe(finalize((value => {}))); // $ExpectError
});
