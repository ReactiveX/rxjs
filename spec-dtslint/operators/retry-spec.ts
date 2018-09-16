import { of } from 'rxjs';
import { retry } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(retry()); // $ExpectType Observable<number>
});

it('should accept a count parameter', () => {
  const o = of(1, 2, 3).pipe(retry(47)); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(retry('aa')); // $ExpectError
});
