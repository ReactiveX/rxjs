import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { timeout } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(timeout(10)));
});

it('should support a date', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(timeout(new Date())));
});

it('should support a scheduler', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(timeout(10, asyncScheduler)));
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(timeout(new Date(), asyncScheduler)));
});

it('should enforce types', () => {
  expectError(of('a', 'b', 'c').pipe(timeout()));
});

it('should enforce types of due', () => {
  expectError(of('a', 'b', 'c').pipe(timeout('foo')));
});

it('should enforce types of scheduler', () => {
  expectError(of('a', 'b', 'c').pipe(timeout(5, 'foo')));
});
