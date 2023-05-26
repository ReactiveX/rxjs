import { of, concatAll } from 'rxjs';

it('should infer correctly', () => {
  const o = of(of(1, 2, 3)).pipe(concatAll()); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(concatAll()); // $ExpectError
});
