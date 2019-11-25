import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { debounceTime } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(debounceTime(47)));
});

it('should support a scheduler', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(debounceTime(47, asyncScheduler)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(debounceTime()));
  expectError(of(1, 2, 3).pipe(debounceTime('foo')));
  expectError(of(1, 2, 3).pipe(debounceTime(47, 'foo')));
});
