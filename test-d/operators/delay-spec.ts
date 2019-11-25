import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { delay } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(delay(100)));
});

it('should support date parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(delay(new Date(2018, 09, 18))));
});

it('should support a scheduler', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(delay(100, asyncScheduler)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(delay()));
  expectError(of(1, 2, 3).pipe(delay('foo')));
  expectError(of(1, 2, 3).pipe(delay(47, 'foo')));
});
