import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { takeWhile } from 'rxjs/operators';

it('should support a user-defined type guard', () => {
  expectType<Observable<"foo">>(of('foo').pipe(takeWhile((s): s is 'foo' => true)));
});

it('should support a user-defined type guard with inclusive option', () => {
  expectType<Observable<"foo">>(of('foo').pipe(takeWhile((s): s is 'foo' => true, false)));
});

it('should support a predicate', () => {
  expectType<Observable<string>>(of('foo').pipe(takeWhile(s => true)));
});

it('should support a predicate with inclusive option', () => {
  expectType<Observable<string>>(of('foo').pipe(takeWhile(s => true, true)));
});
