import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { throttleTime } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(throttleTime(47)));
});

it('should support a scheduler', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(throttleTime(47, asyncScheduler)));
});

it('should support a config', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(throttleTime(47, asyncScheduler, { leading: true, trailing: true })));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(throttleTime()));
  expectError(of(1, 2, 3).pipe(throttleTime('foo')));
});

it('should enforce scheduler types', () => {
  expectError(of(1, 2, 3).pipe(throttleTime(47, null)));
});

it('should enforce config types', () => {
  expectError(of(1, 2, 3).pipe(throttleTime(47, asyncScheduler, { x: 1 })));
  expectError(of(1, 2, 3).pipe(throttleTime(47, asyncScheduler, { leading: 1, trailing: 1 })));
  expectError(of(1, 2, 3).pipe(throttleTime(47, asyncScheduler, null)));
});
