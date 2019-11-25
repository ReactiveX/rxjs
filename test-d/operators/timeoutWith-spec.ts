import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { timeoutWith } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string | number>>(of('a', 'b', 'c').pipe(timeoutWith(10, of(1, 2, 3))));
  expectType<Observable<string | number>>(of('a', 'b', 'c').pipe(timeoutWith(10, [1, 2, 3])));
  expectType<Observable<string | number>>(of('a', 'b', 'c').pipe(timeoutWith(10, Promise.resolve(5))));
  expectType<Observable<string | number>>(of('a', 'b', 'c').pipe(timeoutWith(10, new Set([1, 2, 3]))));
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(timeoutWith(10, 'foo')));
});

it('should infer correctly while having the same types', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(timeoutWith(10, of('x', 'y', 'z'))));
});

it('should support a date', () => {
  expectType<Observable<string | number>>(of('a', 'b', 'c').pipe(timeoutWith(new Date(), of(1, 2, 3))));
  expectType<Observable<string | number>>(of('a', 'b', 'c').pipe(timeoutWith(new Date(), [1, 2, 3])));
  expectType<Observable<string | number>>(of('a', 'b', 'c').pipe(timeoutWith(new Date(), Promise.resolve(5))));
  expectType<Observable<string | number>>(of('a', 'b', 'c').pipe(timeoutWith(new Date(), new Set([1, 2, 3]))));
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(timeoutWith(new Date(), 'foo')));
});

it('should support a scheduler', () => {
  expectType<Observable<string | number>>(of('a', 'b', 'c').pipe(timeoutWith(10, of(1, 2, 3), asyncScheduler)));
  expectType<Observable<string | number>>(of('a', 'b', 'c').pipe(timeoutWith(new Date(), of(1, 2, 3), asyncScheduler)));
});

it('should enforce types', () => {
  expectError(of('a', 'b', 'c').pipe(timeoutWith()));
});

it('should enforce types of due', () => {
  expectError(of('a', 'b', 'c').pipe(timeoutWith('foo')));
});

it('should enforce types of withObservable', () => {
  expectError(of('a', 'b', 'c').pipe(timeoutWith(10, 10)));
});

it('should enforce types of scheduler', () => {
  expectError(of('a', 'b', 'c').pipe(timeoutWith(5, of(1, 2, 3), 'foo')));
});
