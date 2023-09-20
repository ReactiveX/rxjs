import { of, asyncScheduler } from 'rxjs';
import { delay } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(delay(100)); // $ExpectType Observable<number>
});

it('should support date parameter', () => {
  const o = of(1, 2, 3).pipe(delay(new Date(2018, 09, 18))); // $ExpectType Observable<number>
});

it('should support a scheduler', () => {
  const o = of(1, 2, 3).pipe(delay(100, asyncScheduler)); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(delay()); // $ExpectError
  const p = of(1, 2, 3).pipe(delay('foo')); // $ExpectError
  const q = of(1, 2, 3).pipe(delay(47, 'foo')); // $ExpectError
});
