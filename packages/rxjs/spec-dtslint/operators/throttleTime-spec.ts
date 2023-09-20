import { of, asyncScheduler } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(throttleTime(47)); // $ExpectType Observable<number>
});

it('should support a scheduler', () => {
  const o = of(1, 2, 3).pipe(throttleTime(47, asyncScheduler)); // $ExpectType Observable<number>
});

it('should support a config', () => {
  const o = of(1, 2, 3).pipe(throttleTime(47, asyncScheduler, { leading: true, trailing: true })); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(throttleTime()); // $ExpectError
  const p = of(1, 2, 3).pipe(throttleTime('foo')); // $ExpectError
});

it('should enforce scheduler types', () => {
  const o = of(1, 2, 3).pipe(throttleTime(47, null)); // $ExpectError
});

it('should enforce config types', () => {
  const o = of(1, 2, 3).pipe(throttleTime(47, asyncScheduler, { x: 1 })); // $ExpectError
  const p = of(1, 2, 3).pipe(throttleTime(47, asyncScheduler, { leading: 1, trailing: 1 })); // $ExpectError
  const q = of(1, 2, 3).pipe(throttleTime(47, asyncScheduler, null)); // $ExpectError
});
