import { of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(takeUntil(of(1, 2, 3))); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(takeUntil(value => value < 3)); // $ExpectError
});
